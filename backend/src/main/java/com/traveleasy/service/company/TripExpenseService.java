package com.traveleasy.service.company;

import com.traveleasy.dto.company.expense.CompanyExpenseSummaryResponse;
import com.traveleasy.dto.company.expense.SaveTripExpenseRequest;
import com.traveleasy.dto.company.expense.TripProfitLossResponse;

public interface TripExpenseService {
    TripProfitLossResponse getTripProfitLoss(Long tripId, Long companyId);
    TripProfitLossResponse saveTripExpense(Long tripId, Long companyId, SaveTripExpenseRequest request);
    CompanyExpenseSummaryResponse getCompanyExpenseSummary(Long companyId);
}
