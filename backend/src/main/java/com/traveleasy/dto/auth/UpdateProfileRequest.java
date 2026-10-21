package com.traveleasy.dto.auth;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
}
