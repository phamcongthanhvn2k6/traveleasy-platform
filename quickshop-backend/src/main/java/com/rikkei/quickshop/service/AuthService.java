package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.auth.AuthResponse;
import com.rikkei.quickshop.dto.auth.LoginRequest;
import com.rikkei.quickshop.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
