package com.cakebusiness.service;

import com.cakebusiness.config.RazorpayConfig;
import com.cakebusiness.dto.PaymentVerificationResponse;
import com.cakebusiness.dto.RazorpayVerifyRequest;
import com.cakebusiness.entity.Order;
import com.cakebusiness.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RazorpayPaymentServiceTest {

    @Mock
    private RazorpayConfig razorpayConfig;

    @Mock
    private RazorpayClient razorpayClient;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private RazorpayPaymentService paymentService;

    private final String testSecret = "test_secret_123456";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(razorpayConfig.getKeySecret()).thenReturn(testSecret);
        when(razorpayConfig.getKeyId()).thenReturn("rzp_test_key123");
        when(razorpayConfig.getCurrency()).thenReturn("INR");
        when(razorpayConfig.getCompanyName()).thenReturn("Brownie Hub");
    }

    @Test
    void testVerifyPayment_InvalidSignature() {
        RazorpayVerifyRequest req = new RazorpayVerifyRequest();
        req.setRazorpayOrderId("order_123");
        req.setRazorpayPaymentId("pay_456");
        req.setRazorpaySignature("invalid_signature_hash");
        req.setDbOrderId(1L);

        PaymentVerificationResponse response = paymentService.verifyPayment(req);

        assertFalse(response.isSuccess());
        assertEquals("FAILED", response.getOrderStatus());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void testVerifyPayment_ValidSignature() throws Exception {
        String orderId = "order_abc123";
        String paymentId = "pay_xyz789";

        // Calculate valid signature
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(testSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
        String validSignature = HexFormat.of().formatHex(hash);

        Order existingOrder = new Order();
        existingOrder.setId(5L);
        existingOrder.setStatus("PENDING");
        existingOrder.setOrderNumber("ORD-5555");

        when(orderRepository.findById(5L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RazorpayVerifyRequest req = new RazorpayVerifyRequest();
        req.setRazorpayOrderId(orderId);
        req.setRazorpayPaymentId(paymentId);
        req.setRazorpaySignature(validSignature);
        req.setDbOrderId(5L);

        PaymentVerificationResponse response = paymentService.verifyPayment(req);

        assertTrue(response.isSuccess());
        assertEquals("CONFIRMED", response.getOrderStatus());
        assertEquals("CONFIRMED", existingOrder.getStatus());
        verify(orderRepository, times(1)).save(existingOrder);
    }
}
