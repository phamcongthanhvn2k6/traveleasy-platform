package com.traveleasy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_expenses", indexes = {
    @Index(name = "idx_trip_expenses_trip_id", columnList = "trip_id"),
    @Index(name = "idx_trip_expenses_bus_company_id", columnList = "bus_company_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TripExpense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_company_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BusCompany busCompany;

    @Column(name = "fuel_cost", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal fuelCost = BigDecimal.ZERO;

    @Column(name = "toll_bot_cost", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal tollBotCost = BigDecimal.ZERO;

    @Column(name = "driver_salary", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal driverSalary = BigDecimal.ZERO;

    @Column(name = "terminal_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal terminalFee = BigDecimal.ZERO;

    @Column(name = "other_costs", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal otherCosts = BigDecimal.ZERO;

    @Column(name = "invoice_number", length = 100)
    private String invoiceNumber;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BigDecimal getTotalExpense() {
        BigDecimal total = BigDecimal.ZERO;
        if (fuelCost != null) total = total.add(fuelCost);
        if (tollBotCost != null) total = total.add(tollBotCost);
        if (driverSalary != null) total = total.add(driverSalary);
        if (terminalFee != null) total = total.add(terminalFee);
        if (otherCosts != null) total = total.add(otherCosts);
        return total;
    }
}
