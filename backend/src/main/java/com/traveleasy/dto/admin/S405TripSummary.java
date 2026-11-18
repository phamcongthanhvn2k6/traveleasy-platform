package com.traveleasy.dto.admin;

/** Global, unfiltered trip metrics using the same definitions as the Admin Trips page. */
public record S405TripSummary(long total, long scheduled, long cancelled, long totalCapacity, long totalBooked) {
}
