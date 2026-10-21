package com.traveleasy.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatTemplateRequest {
    @NotBlank(message = "Tên mẫu sơ đồ không được để trống")
    private String name;

    private Integer maxFloor;
    private Integer maxRows;
    private Integer maxColumns;
    private Integer totalSeats;
    private String status;
}

