package com.traveleasy.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private String plate;
    private String code;
    private String type;
    private Integer floors;
    private Integer year;
    private Long busCompanyId;
    private String operator;
    private String status;
    private String statusLabel;
    private String seatLayout;
    private String image;
    private LocalDateTime createdAt;
}

