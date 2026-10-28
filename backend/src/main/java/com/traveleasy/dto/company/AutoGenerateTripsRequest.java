package com.traveleasy.dto.company;

import com.traveleasy.entity.BusType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoGenerateTripsRequest {
    private Long busCompanyId;
    private Long routeId;
    @Builder.Default
    private Integer daysAhead = 30;
    private List<String> timeSlots;
    private BusType busType;
    private BigDecimal price;
}
