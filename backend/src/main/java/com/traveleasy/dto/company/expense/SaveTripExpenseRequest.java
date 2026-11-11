package com.traveleasy.dto.company.expense;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveTripExpenseRequest {
    @NotNull(message = "Chi phí xăng dầu không được để trống")
    @DecimalMin(value = "0.00", message = "Chi phí xăng dầu không được âm")
    private BigDecimal fuelCost;

    @NotNull(message = "Chi phí BOT cầu đường không được để trống")
    @DecimalMin(value = "0.00", message = "Chi phí BOT cầu đường không được âm")
    private BigDecimal tollBotCost;

    @NotNull(message = "Lương tài xế/phụ xe không được để trống")
    @DecimalMin(value = "0.00", message = "Lương tài xế không được âm")
    private BigDecimal driverSalary;

    @NotNull(message = "Phí bến bãi không được để trống")
    @DecimalMin(value = "0.00", message = "Phí bến bãi không được âm")
    private BigDecimal terminalFee;

    @NotNull(message = "Chi phí khác không được để trống")
    @DecimalMin(value = "0.00", message = "Chi phí khác không được âm")
    private BigDecimal otherCosts;

    private String invoiceNumber;
    private String notes;
}
