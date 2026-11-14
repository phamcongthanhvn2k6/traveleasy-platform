package com.traveleasy.service.company;

import com.traveleasy.dto.shuttle.*;
import com.traveleasy.entity.ShuttleRequestStatus;

import java.util.List;

/**
 * [S317] Dịch vụ quản lý điều phối xe trung chuyển đón khách tận nơi
 */
public interface CompanyShuttleService {

    List<ShuttleRequestResponse> getShuttleRequests(Long busCompanyId, Long mainTripId, String timeSlot, ShuttleRequestStatus status);

    ShuttleRequestResponse getShuttleRequestById(Long id, Long busCompanyId);

    ShuttleRequestResponse createShuttleRequest(CreateShuttleRequest request, Long busCompanyId);

    ShuttleRequestResponse updateShuttleRequest(Long id, UpdateShuttleRequest request, Long busCompanyId);

    ShuttleRequestResponse assignDriver(Long id, AssignDriverRequest request, Long busCompanyId);

    ShuttleRequestResponse updateStatus(Long id, ShuttleRequestStatus status, Long busCompanyId);
}
