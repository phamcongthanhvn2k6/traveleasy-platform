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

    // Trường thẩm định pháp lý KYB
    private String taxCode;
    private String legalRepresentative;
    private String identityCardNumber;
    private String identityCardFrontUrl;
    private String identityCardBackUrl;
    private String businessLicenseUrl;
    private String transportLicenseUrl;

    // Tài khoản ngân hàng quyết toán
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountOwner;

    // Trạng thái thẩm định
    private String kycStatus;
    private BigDecimal commissionRate;
    private String rejectionReason;
    private LocalDateTime verifiedAt;
    private String verifiedBy;
}
