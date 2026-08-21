package com.cakebusiness.controller;

import com.cakebusiness.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password required"));
        }

        boolean usernameMatch = adminUsername.equals(username);
        boolean passwordMatch = checkPassword(password, adminPassword);

        if (usernameMatch && passwordMatch) {
            String token = jwtUtil.generateToken(username);
            return ResponseEntity.ok(Map.of("token", token, "username", username));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid credentials"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT is stateless — client discards token
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * Supports both BCrypt hashed passwords (starting with $2) and plain passwords
     * stored via environment variable for initial setup. In production, set
     * ADMIN_PASSWORD to a BCrypt hash.
     */
    private boolean checkPassword(String rawPassword, String storedPassword) {
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            return BCrypt.checkpw(rawPassword, storedPassword);
        }
        // Plain comparison (acceptable for local dev; use BCrypt hash in production)
        return storedPassword.equals(rawPassword);
    }
}
