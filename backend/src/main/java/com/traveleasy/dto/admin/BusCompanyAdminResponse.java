package com.traveleasy.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusCompanyAdminResponse {
    private Long id;
    private String name;
    private String code;
    private String hotline;
    private String email;
    private String address;
    private String logoUrl;
    private String status;
    private String statusLabel;
    private BigDecimal averageRating;
    private LocalDateTime createdAt;
}

