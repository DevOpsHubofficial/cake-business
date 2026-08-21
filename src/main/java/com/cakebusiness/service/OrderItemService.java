package com.cakebusiness.service;

import com.cakebusiness.dto.OrderItemRequest;
import com.cakebusiness.entity.Order;
import com.cakebusiness.entity.OrderItem;
import com.cakebusiness.entity.Product;
import com.cakebusiness.repository.OrderItemRepository;
import com.cakebusiness.repository.OrderRepository;
import com.cakebusiness.repository.ProductRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderItemService(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository,
            ProductRepository productRepository) {

        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public OrderItem create(OrderItemRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with ID: "
                                        + request.getOrderId()
                        )
                );

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with ID: "
                                        + request.getProductId()
                        )
                );

        BigDecimal basePrice = product.getPrice();
        BigDecimal unitPrice = basePrice;

        // Server-side validation for size-based customization
        if (request.getSizeLabel() != null && !request.getSizeLabel().isBlank()) {
            String size = request.getSizeLabel().trim().toLowerCase();
            if (size.contains("1.0 kg") || size.contains("1 kg") || size.contains("standard")) {
                unitPrice = basePrice.multiply(BigDecimal.valueOf(1.8)).setScale(0, java.math.RoundingMode.HALF_UP);
            } else if (size.contains("1.5 kg") || size.contains("party")) {
                unitPrice = basePrice.multiply(BigDecimal.valueOf(2.6)).setScale(0, java.math.RoundingMode.HALF_UP);
            } else if (size.contains("2.0 kg") || size.contains("2 kg") || size.contains("grand")) {
                unitPrice = basePrice.multiply(BigDecimal.valueOf(3.4)).setScale(0, java.math.RoundingMode.HALF_UP);
            } else if (size.contains("0.5 kg") || size.contains("small")) {
                unitPrice = basePrice;
            } else if (request.getUnitPrice() != null && request.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
                // If customized unit price passed, ensure it's at least base price
                if (request.getUnitPrice().compareTo(basePrice) >= 0) {
                    unitPrice = request.getUnitPrice();
                }
            }
        } else if (request.getUnitPrice() != null && request.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
            // Direct unit price passed, ensure it is at least base price
            if (request.getUnitPrice().compareTo(basePrice) >= 0) {
                unitPrice = request.getUnitPrice();
            }
        }

        BigDecimal totalPrice = unitPrice.multiply(
                BigDecimal.valueOf(request.getQuantity())
        );

        OrderItem orderItem = new OrderItem();

        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setQuantity(request.getQuantity());

        orderItem.setUnitPrice(unitPrice);
        orderItem.setTotalPrice(totalPrice);

        return orderItemRepository.save(orderItem);
    }

    public List<OrderItem> getAll() {
        return orderItemRepository.findAll();
    }

    public OrderItem getById(Long id) {

        return orderItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order item not found with ID: " + id
                        )
                );
    }

    public List<OrderItem> getByOrderId(Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException(
                    "Order not found with ID: " + orderId
            );
        }

        return orderItemRepository.findByOrderId(orderId);
    }

    public void delete(Long id) {

        if (!orderItemRepository.existsById(id)) {
            throw new RuntimeException(
                    "Order item not found with ID: " + id
            );
        }

        orderItemRepository.deleteById(id);
    }
}