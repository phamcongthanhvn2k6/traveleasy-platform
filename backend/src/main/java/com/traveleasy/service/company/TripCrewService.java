package com.traveleasy.service.company;

import com.traveleasy.dto.company.crew.AssignCrewRequest;
import com.traveleasy.dto.company.crew.TripCrewResponse;

import java.util.List;

public interface TripCrewService {
    List<TripCrewResponse> getCrewAssignments(Long busCompanyId, String date);
    TripCrewResponse assignCrew(Long busCompanyId, AssignCrewRequest request);
    TripCrewResponse signDispatchPermit(Long busCompanyId, Long tripId);
}
