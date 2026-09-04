package com.sunrise.dental.controller;

import com.sunrise.dental.model.LoginRequest;
import com.sunrise.dental.service.AuthService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest) {
        try {
            boolean isValid = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
            if (!isValid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid username or password"));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "role", authService.getUserRole(loginRequest.getUsername())
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody LoginRequest loginRequest) {
        try {
            authService.register(
                    loginRequest.getUsername(),
                    loginRequest.getPassword(),
                    loginRequest.getRole(),
                    loginRequest.getFullName(),
                    loginRequest.getEmail(),
                    loginRequest.getPhoneNumber()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Account created successfully. Please log in.",
                            "role", authService.getUserRole(loginRequest.getUsername())
                    ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
