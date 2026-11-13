package com.traveleasy.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * [S310][REPORTS] Integration Test for Company Reports & Analytics API
 * Endpoint: /api/v1/company/reports
 * @author Nguyễn Đại Phát (phatnguyn146)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class S310ReportsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/company/reports/summary - Trả về dữ liệu KPI, hoa hồng sàn 8% và phân tích chuyến xe")
    void testGetReportSummary() throws Exception {
        mockMvc.perform(get("/api/v1/company/reports/summary")
                        .param("companyId", "14")
                        .param("period", "MONTH")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.busCompanyId").value(14))
                .andExpect(jsonPath("$.data.platformFeeRate").value(8.0))
                .andExpect(jsonPath("$.data.totalGrossRevenue").exists())
                .andExpect(jsonPath("$.data.totalPlatformFee").exists())
                .andExpect(jsonPath("$.data.totalNetRevenue").exists())
                .andExpect(jsonPath("$.data.avgOccupancyRate").exists())
                .andExpect(jsonPath("$.data.chartData").isArray())
                .andExpect(jsonPath("$.data.routePerformances").isArray())
                .andExpect(jsonPath("$.data.tripPerformances").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/company/reports/trips - Trả về danh sách chi tiết chuyến xe kèm mức độ lấp đầy")
    void testGetTripPerformances() throws Exception {
        mockMvc.perform(get("/api/v1/company/reports/trips")
                        .param("companyId", "14")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/company/reports/export-csv - Xuất file bảng tính Excel/CSV có header Content-Disposition")
    void testExportReportCsv() throws Exception {
        mockMvc.perform(get("/api/v1/company/reports/export-csv")
                        .param("companyId", "14")
                        .param("period", "MONTH"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString("attachment; filename=")))
                .andExpect(content().string(containsString("BÁO CÁO THỐNG KÊ DOANH THU & TỶ LỆ LẤP ĐẦY GHẾ")));
    }
}
