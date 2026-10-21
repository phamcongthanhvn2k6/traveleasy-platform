package com.traveleasy.dto.company;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    @NotBlank(message = "Biển số xe không được để trống")
    private String plateNumber;

    private Long busCompanyId;
    private String vehicleCode;
    private String vehicleType; // SLEEPER, LIMOUSINE, SEATED
    private Integer floors;
    private Integer manufactureYear;
    private String seatLayout;
    private String imageUrl;
    private String status;
}

