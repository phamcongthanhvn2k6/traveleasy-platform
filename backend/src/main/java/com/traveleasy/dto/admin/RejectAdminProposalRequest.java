package com.traveleasy.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectAdminProposalRequest {

    @NotBlank(message = "Vui lòng nhập lý do từ chối yêu cầu")
    private String reason;
}

