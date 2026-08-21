package com.cakebusiness.controller;

import com.cakebusiness.dto.GuestCustomerRequest;
import com.cakebusiness.entity.Customer;
import com.cakebusiness.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(
                customerService.getAllCustomers()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                customerService.getCustomerById(id)
        );
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @RequestBody Customer customer) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(customerService.createCustomer(customer));
    }

    @PostMapping("/guest")
    public ResponseEntity<Customer> createOrFindGuestCustomer(
            @Valid @RequestBody GuestCustomerRequest request) {

        return ResponseEntity.ok(
                customerService.findOrCreateByPhone(request)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @RequestBody Customer customer) {

        return ResponseEntity.ok(
                customerService.updateCustomer(id, customer)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);

        return ResponseEntity.noContent().build();
    }
}
