package com.nippon.incentive.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class LoginRequest {

    @NotBlank
    private String email;

    @NotBlank
    private String password;

    // No-args constructor
    public LoginRequest() {
    }

    // All-args constructor
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}