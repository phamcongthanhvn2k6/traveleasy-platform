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
public class BannerRequest {
    @NotBlank(message = "Tiêu đề banner không được để trống")
    private String title;

    private String imagePath;
    private String position;
    private String status;
    private String duration;
    private String link;
}

