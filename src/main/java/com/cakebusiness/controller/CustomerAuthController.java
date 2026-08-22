package com.cakebusiness.controller;

import com.cakebusiness.dto.CustomerRegisterRequest;
import com.cakebusiness.entity.Customer;
import com.cakebusiness.entity.Order;
import com.cakebusiness.repository.CustomerRepository;
import com.cakebusiness.repository.OrderRepository;
import com.cakebusiness.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer-auth")
public class CustomerAuthController {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final JwtUtil jwtUtil;

    public CustomerAuthController(CustomerRepository customerRepository,
                                  OrderRepository orderRepository,
                                  JwtUtil jwtUtil) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CustomerRegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        String phone = req.getPhone().trim();

        // Check if a customer with this email and a password already exists
        Optional<Customer> existingByEmail = customerRepository.findFirstByEmailOrderByIdDesc(email);
        if (existingByEmail.isPresent() && existingByEmail.get().getPasswordHash() != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists"));
        }

        // Check if existing record by phone
        Customer customer = existingByEmail.orElseGet(() ->
                customerRepository.findFirstByPhoneOrderByIdDesc(phone).orElse(new Customer())
        );

        customer.setName(req.getName().trim());
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setPasswordHash(BCrypt.hashpw(req.getPassword(), BCrypt.gensalt(10)));
        if (req.getAddress() != null) customer.setAddress(req.getAddress().trim());
        if (req.getCity() != null) customer.setCity(req.getCity().trim());
        if (req.getState() != null) customer.setState(req.getState().trim());
        if (req.getPostalCode() != null) customer.setPostalCode(req.getPostalCode().trim());

        Customer saved = customerRepository.save(customer);

        String token = jwtUtil.generateToken(saved.getEmail(), "ROLE_CUSTOMER");

        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("customer", sanitizeCustomer(saved));

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<Customer> customerOpt = customerRepository.findFirstByEmailOrderByIdDesc(email.trim().toLowerCase());
        if (customerOpt.isEmpty() || customerOpt.get().getPasswordHash() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No registered account found with this email. Please register first."));
        }

        Customer customer = customerOpt.get();
        if (!BCrypt.checkpw(password, customer.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(customer.getEmail(), "ROLE_CUSTOMER");

        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("customer", sanitizeCustomer(customer));

        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentCustomer(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Customer customer = resolveCustomerFromHeader(authHeader);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized or invalid customer session"));
        }
        return ResponseEntity.ok(sanitizeCustomer(customer));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody Map<String, String> updates) {
        Customer customer = resolveCustomerFromHeader(authHeader);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        if (updates.containsKey("name") && !updates.get("name").isBlank()) {
            customer.setName(updates.get("name").trim());
        }
        if (updates.containsKey("phone") && !updates.get("phone").isBlank()) {
            customer.setPhone(updates.get("phone").trim());
        }
        if (updates.containsKey("address")) {
            customer.setAddress(updates.get("address"));
        }
        if (updates.containsKey("city")) {
            customer.setCity(updates.get("city"));
        }
        if (updates.containsKey("state")) {
            customer.setState(updates.get("state"));
        }
        if (updates.containsKey("postalCode")) {
            customer.setPostalCode(updates.get("postalCode"));
        }

        Customer saved = customerRepository.save(customer);
        return ResponseEntity.ok(sanitizeCustomer(saved));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getCustomerOrders(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Customer customer = resolveCustomerFromHeader(authHeader);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        List<Order> orders = orderRepository.findByCustomerId(customer.getId());
        return ResponseEntity.ok(orders);
    }

    private Customer resolveCustomerFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return null;
        }
        String email = jwtUtil.extractUsername(token);
        return customerRepository.findFirstByEmailOrderByIdDesc(email.toLowerCase()).orElse(null);
    }

    private Map<String, Object> sanitizeCustomer(Customer c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("name", c.getName());
        map.put("email", c.getEmail());
        map.put("phone", c.getPhone());
        map.put("address", c.getAddress());
        map.put("city", c.getCity());
        map.put("state", c.getState());
        map.put("postalCode", c.getPostalCode());
        map.put("createdAt", c.getCreatedAt());
        return map;
    }
}
