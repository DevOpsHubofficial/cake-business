package com.cakebusiness.controller;

import com.cakebusiness.entity.Order;
import com.cakebusiness.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.getOrderById(id)
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderService.getOrdersByCustomer(customerId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                orderService.getOrdersByStatus(status)
        );
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody Order order) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orderService.createOrder(order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, status)
        );
    }
}