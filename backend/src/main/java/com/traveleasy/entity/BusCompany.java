package com.traveleasy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bus_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BusCompany {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(name = "code", length = 50)
    private String code;

    @Column(nullable = false, length = 20)
    private String hotline;

    @Column(length = 100)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.valueOf(5.0);

    @Column(length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    // Hồ sơ thẩm định pháp lý doanh nghiệp (KYB Verification Dossier)
    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "legal_representative", length = 150)
    private String legalRepresentative;

    @Column(name = "identity_card_number", length = 50)
    private String identityCardNumber;

    @Column(name = "identity_card_front_url", columnDefinition = "TEXT")
    private String identityCardFrontUrl;

    @Column(name = "identity_card_back_url", columnDefinition = "TEXT")
    private String identityCardBackUrl;

    @Column(name = "business_license_url", columnDefinition = "TEXT")
    private String businessLicenseUrl;

    @Column(name = "transport_license_url", columnDefinition = "TEXT")
    private String transportLicenseUrl;

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "bank_account_number", length = 100)
    private String bankAccountNumber;

    @Column(name = "bank_account_owner", length = 150)
    private String bankAccountOwner;

    @Column(name = "kyc_status", length = 50)
    @Builder.Default
    private String kycStatus = "PENDING_APPROVAL";

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = BigDecimal.valueOf(8.00);

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verified_by", length = 150)
    private String verifiedBy;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
