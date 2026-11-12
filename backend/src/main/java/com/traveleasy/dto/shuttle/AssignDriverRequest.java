package com.traveleasy.dto.shuttle;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * [S317] DTO gán tài xế nhanh cho xe trung chuyển
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignDriverRequest {

    @NotBlank(message = "Tên tài xế không được để trống")
    private String driverName;

    @NotBlank(message = "Biển số xe trung chuyển không được để trống")
    private String vehiclePlate;
}
