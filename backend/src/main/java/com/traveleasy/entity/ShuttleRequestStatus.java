package com.traveleasy.entity;

/**
 * [S317] Vòng đời trạng thái yêu cầu trung chuyển đón/trả tận nhà
 * PENDING -> ASSIGNED -> PICKING_UP -> PICKED_UP -> ARRIVED_TERMINAL / COMPLETED
 */
public enum ShuttleRequestStatus {
    PENDING,
    ASSIGNED,
    PICKING_UP,
    PICKED_UP,
    ARRIVED_TERMINAL,
    COMPLETED,
    CANCELLED
}
