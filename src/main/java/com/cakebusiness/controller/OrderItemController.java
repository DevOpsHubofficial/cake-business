package com.cakebusiness.controller;

import com.cakebusiness.dto.OrderItemRequest;
import com.cakebusiness.entity.OrderItem;
import com.cakebusiness.service.OrderItemService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin(origins = "*")
public class OrderItemController {

    private final OrderItemService orderItemService;

    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderItem create(
        @Valid @RequestBody OrderItemRequest request) {

    return orderItemService.create(request);
}

    @GetMapping
    public List<OrderItem> getAll() {
        return orderItemService.getAll();
    }

    @GetMapping("/{id}")
    public OrderItem getById(@PathVariable Long id) {
        return orderItemService.getById(id);
    }

    @GetMapping("/order/{orderId}")
    public List<OrderItem> getByOrderId(
            @PathVariable Long orderId) {

        return orderItemService.getByOrderId(orderId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        orderItemService.delete(id);
    }
}