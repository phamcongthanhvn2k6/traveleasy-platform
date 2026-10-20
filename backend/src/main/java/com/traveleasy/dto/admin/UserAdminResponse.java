package com.traveleasy.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String roleLabel;
    private String status;
    private LocalDateTime createdAt;
}

