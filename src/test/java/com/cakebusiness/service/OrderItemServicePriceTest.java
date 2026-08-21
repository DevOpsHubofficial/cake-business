package com.cakebusiness.service;

import com.cakebusiness.dto.OrderItemRequest;
import com.cakebusiness.entity.Order;
import com.cakebusiness.entity.OrderItem;
import com.cakebusiness.entity.Product;
import com.cakebusiness.repository.OrderItemRepository;
import com.cakebusiness.repository.OrderRepository;
import com.cakebusiness.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class OrderItemServicePriceTest {

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderItemService orderItemService;

    private Product product;
    private Order order;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        product = new Product();
        product.setId(1L);
        product.setName("Signature Truffle Cake");
        product.setPrice(new BigDecimal("500.00"));

        order = new Order();
        order.setId(10L);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testStandard0_5kgProduct() {
        OrderItemRequest req = new OrderItemRequest();
        req.setOrderId(10L);
        req.setProductId(1L);
        req.setQuantity(2);
        req.setSizeLabel("0.5 kg (Small)");

        OrderItem item = orderItemService.create(req);
        assertEquals(new BigDecimal("500.00"), item.getUnitPrice());
        assertEquals(new BigDecimal("1000.00"), item.getTotalPrice());
    }

    @Test
    void testCustomized1kgProduct() {
        OrderItemRequest req = new OrderItemRequest();
        req.setOrderId(10L);
        req.setProductId(1L);
        req.setQuantity(1);
        req.setSizeLabel("1.0 kg (Standard)");

        // 500 * 1.8 = 900
        OrderItem item = orderItemService.create(req);
        assertEquals(new BigDecimal("900"), item.getUnitPrice());
        assertEquals(new BigDecimal("900"), item.getTotalPrice());
    }

    @Test
    void testCustomized1_5kgProduct() {
        OrderItemRequest req = new OrderItemRequest();
        req.setOrderId(10L);
        req.setProductId(1L);
        req.setQuantity(2);
        req.setSizeLabel("1.5 kg (Party)");

        // 500 * 2.6 = 1300
        OrderItem item = orderItemService.create(req);
        assertEquals(new BigDecimal("1300"), item.getUnitPrice());
        assertEquals(new BigDecimal("2600"), item.getTotalPrice());
    }
}
