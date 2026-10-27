package com.traveleasy.dto.booking;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class CancelPartialRequest {
    @NotEmpty(message = "Danh sách mã vé cần hủy không được để trống")
    private List<Long> ticketIds;
}
