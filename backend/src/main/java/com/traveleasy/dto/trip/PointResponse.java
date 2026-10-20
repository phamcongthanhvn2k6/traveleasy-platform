package com.traveleasy.dto.trip;

import com.traveleasy.entity.PointType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointResponse {
    private Long id;
    private String name;
    private String address;
    private PointType pointType;
    private Integer orderIndex;
}
