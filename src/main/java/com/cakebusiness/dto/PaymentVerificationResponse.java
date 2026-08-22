package com.cakebusiness.dto;

public class PaymentVerificationResponse {

    private boolean success;
    private String message;
    private Long orderId;
    private String orderNumber;
    private String paymentId;
    private String orderStatus;

    public PaymentVerificationResponse() {
    }

    public PaymentVerificationResponse(boolean success, String message, Long orderId, String orderNumber, String paymentId, String orderStatus) {
        this.success = success;
        this.message = message;
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.paymentId = paymentId;
        this.orderStatus = orderStatus;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }
}
