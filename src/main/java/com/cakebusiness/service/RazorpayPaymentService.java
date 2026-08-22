package com.cakebusiness.service;

import com.cakebusiness.config.RazorpayConfig;
import com.cakebusiness.dto.PaymentVerificationResponse;
import com.cakebusiness.dto.RazorpayOrderRequest;
import com.cakebusiness.dto.RazorpayOrderResponse;
import com.cakebusiness.dto.RazorpayVerifyRequest;
import com.cakebusiness.entity.Order;
import com.cakebusiness.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class RazorpayPaymentService {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayPaymentService.class);

    private final RazorpayConfig razorpayConfig;
    private final RazorpayClient razorpayClient;
    private final OrderRepository orderRepository;

    public RazorpayPaymentService(
            RazorpayConfig razorpayConfig,
            RazorpayClient razorpayClient,
            OrderRepository orderRepository) {
        this.razorpayConfig = razorpayConfig;
        this.razorpayClient = razorpayClient;
        this.orderRepository = orderRepository;
    }

    public RazorpayConfig getRazorpayConfig() {
        return razorpayConfig;
    }

    /**
     * Create a Razorpay Order in paise (Test Mode)
     */
    public RazorpayOrderResponse createOrder(RazorpayOrderRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        BigDecimal amount = request.getAmount();
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();
        String currency = razorpayConfig.getCurrency() != null ? razorpayConfig.getCurrency() : "INR";
        String receipt = request.getOrderNumber() != null && !request.getOrderNumber().isBlank()
                ? request.getOrderNumber()
                : "rcpt_" + System.currentTimeMillis();

        try {
            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", currency);
            options.put("receipt", receipt);

            JSONObject notes = new JSONObject();
            if (request.getOrderId() != null) {
                notes.put("dbOrderId", request.getOrderId().toString());
            }
            if (request.getCustomerName() != null) {
                notes.put("customerName", request.getCustomerName());
            }
            if (request.getCustomerPhone() != null) {
                notes.put("customerPhone", request.getCustomerPhone());
            }
            options.put("notes", notes);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(options);
            String razorpayOrderId = razorpayOrder.get("id");

            logger.info("Created Razorpay Order: {} for amount: {} paise (Receipt: {})",
                    razorpayOrderId, amountInPaise, receipt);

            return new RazorpayOrderResponse(
                    razorpayOrderId,
                    amount,
                    amountInPaise,
                    currency,
                    razorpayConfig.getKeyId(),
                    razorpayConfig.getCompanyName(),
                    request.getOrderId(),
                    request.getOrderNumber()
            );
        } catch (Exception e) {
            logger.error("Failed to create Razorpay Order: {}", e.getMessage(), e);
            String msg = e.getMessage();
            if (msg != null && (msg.contains("Authentication failed") || msg.contains("key id provided is invalid"))) {
                msg = "Razorpay authentication failed: Invalid or placeholder Key ID/Secret. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.";
            }
            throw new RuntimeException(msg != null ? msg : "Error creating Razorpay Order", e);
        }
    }

    /**
     * Verifies payment signature and updates the DB order status
     */
    public PaymentVerificationResponse verifyPayment(RazorpayVerifyRequest verifyRequest) {
        if (verifyRequest.getRazorpayOrderId() == null || verifyRequest.getRazorpayOrderId().isBlank()
                || verifyRequest.getRazorpayPaymentId() == null || verifyRequest.getRazorpayPaymentId().isBlank()
                || verifyRequest.getRazorpaySignature() == null || verifyRequest.getRazorpaySignature().isBlank()) {
            return new PaymentVerificationResponse(
                    false,
                    "Invalid payment verification payload. Missing required fields.",
                    verifyRequest.getDbOrderId(),
                    null,
                    verifyRequest.getRazorpayPaymentId(),
                    "FAILED"
            );
        }

        boolean isValid = verifySignature(
                verifyRequest.getRazorpayOrderId(),
                verifyRequest.getRazorpayPaymentId(),
                verifyRequest.getRazorpaySignature(),
                razorpayConfig.getKeySecret()
        );

        if (!isValid) {
            logger.warn("Invalid signature for Razorpay Order: {} and Payment: {}",
                    verifyRequest.getRazorpayOrderId(), verifyRequest.getRazorpayPaymentId());
            return new PaymentVerificationResponse(
                    false,
                    "Payment signature verification failed. Untrusted transaction.",
                    verifyRequest.getDbOrderId(),
                    null,
                    verifyRequest.getRazorpayPaymentId(),
                    "FAILED"
            );
        }

        // Update database order status if dbOrderId is provided
        Long dbOrderId = verifyRequest.getDbOrderId();
        String orderNumber = null;
        String newStatus = "CONFIRMED";

        if (dbOrderId != null) {
            Optional<Order> orderOpt = orderRepository.findById(dbOrderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                order.setStatus(newStatus);

                String existingNotes = order.getNotes() != null ? order.getNotes() : "";
                String paymentNote = String.format("[Razorpay Paid: %s | Order: %s]",
                        verifyRequest.getRazorpayPaymentId(), verifyRequest.getRazorpayOrderId());
                order.setNotes(existingNotes.isBlank() ? paymentNote : existingNotes + " | " + paymentNote);

                orderRepository.save(order);
                orderNumber = order.getOrderNumber();
                logger.info("Order #{} marked as CONFIRMED following verified payment {}", dbOrderId, verifyRequest.getRazorpayPaymentId());
            }
        }

        return new PaymentVerificationResponse(
                true,
                "Payment successfully verified and order confirmed.",
                dbOrderId,
                orderNumber,
                verifyRequest.getRazorpayPaymentId(),
                newStatus
        );
    }

    /**
     * Compute and compare HMAC-SHA256 signature
     */
    private boolean verifySignature(String orderId, String paymentId, String signature, String secret) {
        if (secret == null || secret.isBlank()) {
            logger.warn("Razorpay key secret is not configured.");
            return false;
        }

        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = HexFormat.of().formatHex(hash);

            return generatedSignature.equalsIgnoreCase(signature.trim());
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Error computing signature hash: {}", e.getMessage(), e);
            return false;
        }
    }
}
