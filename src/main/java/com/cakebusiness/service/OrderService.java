package com.cakebusiness.service;

import com.cakebusiness.entity.Customer;
import com.cakebusiness.entity.Order;
import com.cakebusiness.repository.CustomerRepository;
import com.cakebusiness.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository) {

        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with id: " + id
                        ));
    }

    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public Order createOrder(Order order) {

        if (order.getCustomer() == null
                || order.getCustomer().getId() == null) {

            throw new RuntimeException(
                    "Customer ID is required"
            );
        }

        Customer customer = customerRepository
                .findById(order.getCustomer().getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + order.getCustomer().getId()
                        ));

        order.setCustomer(customer);

        if (order.getOrderNumber() == null
                || order.getOrderNumber().isBlank()) {

            order.setOrderNumber(
                    "ORD-" + UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase()
            );
        }

        if (order.getStatus() == null
                || order.getStatus().isBlank()) {

            order.setStatus("PENDING");
        }

        if (order.getSubtotal() == null) {
            order.setSubtotal(BigDecimal.ZERO);
        }

        if (order.getDeliveryFee() == null) {
            order.setDeliveryFee(BigDecimal.ZERO);
        }

        if (order.getDiscount() == null) {
            order.setDiscount(BigDecimal.ZERO);
        }

        BigDecimal total = order.getSubtotal()
                .add(order.getDeliveryFee())
                .subtract(order.getDiscount());

        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(
            Long id,
            String status) {

        Order order = getOrderById(id);

        order.setStatus(status);

        return orderRepository.save(order);
    }
}