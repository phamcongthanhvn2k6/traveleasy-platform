package com.traveleasy.dto.booking;

import lombok.Data;
import java.util.List;

@Data
public class CancelPartialRequest {
    private List<Long> ticketIds;
}

