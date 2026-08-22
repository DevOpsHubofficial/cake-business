package com.cakebusiness.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayConfig.class);

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${razorpay.company-name:Brownie Hub}")
    private String companyName;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
                logger.warn("Razorpay credentials not fully configured; using sandbox placeholder client.");
                return new RazorpayClient("rzp_test_placeholder", "placeholder_secret");
            }
            return new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException e) {
            logger.error("Failed to initialize RazorpayClient: {}", e.getMessage(), e);
            throw new RuntimeException("Could not initialize Razorpay client", e);
        }
    }

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public String getCurrency() {
        return currency;
    }

    public String getCompanyName() {
        return companyName;
    }
}
