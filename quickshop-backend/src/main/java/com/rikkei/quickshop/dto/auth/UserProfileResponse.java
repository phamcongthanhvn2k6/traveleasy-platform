package com.rikkei.quickshop.dto.auth;

import com.rikkei.quickshop.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private Role role;
}
