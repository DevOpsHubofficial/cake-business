package com.cakebusiness.controller;

import com.cakebusiness.dto.PaymentVerificationResponse;
import com.cakebusiness.dto.RazorpayOrderRequest;
import com.cakebusiness.dto.RazorpayOrderResponse;
import com.cakebusiness.dto.RazorpayVerifyRequest;
import com.cakebusiness.service.RazorpayPaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/razorpay")
public class PaymentController {

    private final RazorpayPaymentService paymentService;

    public PaymentController(RazorpayPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Expose only public Razorpay details to frontend (never secrets)
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getRazorpayConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("keyId", paymentService.getRazorpayConfig().getKeyId());
        config.put("currency", paymentService.getRazorpayConfig().getCurrency());
        config.put("companyName", paymentService.getRazorpayConfig().getCompanyName());
        return ResponseEntity.ok(config);
    }

    /**
     * Create Razorpay order securely from backend
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody RazorpayOrderRequest request) {
        try {
            RazorpayOrderResponse response = paymentService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Secure server-side signature verification
     */
    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(@RequestBody RazorpayVerifyRequest verifyRequest) {
        PaymentVerificationResponse response = paymentService.verifyPayment(verifyRequest);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
