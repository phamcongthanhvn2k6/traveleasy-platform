package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.auth.UpdateProfileRequest;
import com.rikkei.quickshop.dto.auth.UserProfileResponse;

public interface UserService {
    UserProfileResponse getCurrentProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
