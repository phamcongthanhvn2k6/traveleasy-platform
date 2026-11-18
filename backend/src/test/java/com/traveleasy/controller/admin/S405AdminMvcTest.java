package com.traveleasy.controller.admin;

import com.traveleasy.common.exception.GlobalExceptionHandler;
import com.traveleasy.dto.admin.S405BookingSummary;
import com.traveleasy.dto.admin.S405TripSummary;
import com.traveleasy.dto.booking.BookingResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.security.CustomUserDetailsService;
import com.traveleasy.security.JwtAuthenticationFilter;
import com.traveleasy.security.JwtTokenProvider;
import com.traveleasy.security.SecurityConfig;
import com.traveleasy.service.admin.AdminTripService;
import com.traveleasy.service.customer.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** MVC contract and authorization tests; SQL integration is covered separately. */
@WebMvcTest(controllers = {S405AdminListController.class, AdminTripController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class})
class S405AdminMvcTest {
    @Autowired MockMvc mvc;
    @MockBean AdminTripService trips;
    @MockBean BookingService bookings;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService userDetailsService;

    private static final String ROOT = "/api/v1/admin";

    @Test
    void protectedEndpointsRejectAnonymousAndCompany() throws Exception {
        for (String path : List.of("/trips/page", "/bookings/page", "/trips/summary",
                "/bookings/summary", "/trips/export")) {
            mvc.perform(get(ROOT + path)).andExpect(status().isUnauthorized());
            mvc.perform(get(ROOT + path).with(user("company").roles("COMPANY")))
                    .andExpect(status().isForbidden());
        }
        verifyNoInteractions(trips, bookings);
    }

    @Test
    void invalidPageSizeStatusDateAndIdsReturn400() throws Exception {
        for (String path : List.of("/trips/page", "/bookings/page")) {
            for (String[] p : new String[][] {
                    {"page", "-1"}, {"page", "abc"}, {"size", "0"}, {"size", "101"},
                    {"status", "INVALID"}, {"busCompanyId", "0"}, {"routeId", "-1"},
                    {"departureFrom", "2026-02-30"}, {"departureTo", "not-a-date"}
            }) {
                mvc.perform(get(ROOT + path).with(user("admin").roles("ADMIN")).param(p[0], p[1]))
                        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false));
            }
            mvc.perform(get(ROOT + path).with(user("admin").roles("ADMIN"))
                            .param("departureFrom", "2026-05-21").param("departureTo", "2026-05-20"))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false));
        }
        verifyNoInteractions(trips, bookings);
    }

    @Test
    void paginatedResponseUsesZeroBasedMetadataAndForwardsInclusiveDateAsExclusiveUpperBound() throws Exception {
        TripResponse trip = TripResponse.builder().id(42L).build();
        when(trips.getS405Trips(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(trip), PageRequest.of(1, 2), 3));
        mvc.perform(get(ROOT + "/trips/page").with(user("admin").roles("ADMIN"))
                        .param("page", "1").param("size", "2").param("search", "abc")
                        .param("busCompanyId", "2").param("routeId", "3")
                        .param("departureFrom", "2026-05-20").param("departureTo", "2026-05-21")
                        .param("status", "RUNNING"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].id").value(42))
                .andExpect(jsonPath("$.data.page").value(1)).andExpect(jsonPath("$.data.size").value(2))
                .andExpect(jsonPath("$.data.totalElements").value(3)).andExpect(jsonPath("$.data.totalPages").value(2));
        verify(trips).getS405Trips(eq("abc"), eq(2L), eq(3L),
                eq(LocalDateTime.of(2026, 5, 20, 0, 0)), eq(LocalDateTime.of(2026, 5, 22, 0, 0)),
                eq(TripStatus.RUNNING), eq(PageRequest.of(1, 2)));
    }

    @Test
    void everyBackendStatusAndMaximumSizeAreAccepted() throws Exception {
        when(trips.getS405Trips(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 100), 0));
        when(bookings.getS405BookingPage(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 100), 0));
        for (String status : List.of("SCHEDULED", "DEPARTED", "RUNNING", "COMPLETED", "CANCELLED")) {
            mvc.perform(get(ROOT + "/trips/page").with(user("admin").roles("ADMIN"))
                            .param("size", "100").param("status", status))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(0));
        }
        for (String status : List.of("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED")) {
            mvc.perform(get(ROOT + "/bookings/page").with(user("admin").roles("ADMIN"))
                            .param("size", "100").param("status", status))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalPages").value(0));
        }
    }

    @Test
    void bookingsPageReturnsMetadataAndAcceptsCompleted() throws Exception {
        when(bookings.getS405BookingPage(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(BookingResponse.builder().id(7L).build()), PageRequest.of(0, 10), 1));
        mvc.perform(get(ROOT + "/bookings/page").with(user("admin").roles("ADMIN"))
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].id").value(7))
                .andExpect(jsonPath("$.data.page").value(0)).andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.totalElements").value(1)).andExpect(jsonPath("$.data.totalPages").value(1));
    }

    @Test
    void legacyEndpointsStillReturnArraysAndTripsLimit() throws Exception {
        when(trips.getAllTrips()).thenReturn(List.of(TripResponse.builder().id(1L).build(), TripResponse.builder().id(2L).build()));
        when(bookings.getAllBookings()).thenReturn(List.of(BookingResponse.builder().id(3L).build()));
        mvc.perform(get(ROOT + "/trips").with(user("admin").roles("ADMIN")).param("limit", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(1));
        mvc.perform(get(ROOT + "/bookings").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(3));
    }

    @Test
    void summariesExposeGlobalKpisWithoutChangingRevenueDefinition() throws Exception {
        when(trips.getS405TripSummary()).thenReturn(new S405TripSummary(6, 2, 1, 120, 30));
        when(bookings.getS405BookingSummary()).thenReturn(new S405BookingSummary(7, 2, 3, 1, new BigDecimal("250000")));
        mvc.perform(get(ROOT + "/trips/summary").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.total").value(6)).andExpect(jsonPath("$.data.scheduled").value(2))
                .andExpect(jsonPath("$.data.cancelled").value(1)).andExpect(jsonPath("$.data.totalCapacity").value(120))
                .andExpect(jsonPath("$.data.totalBooked").value(30));
        mvc.perform(get(ROOT + "/bookings/summary").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.total").value(7)).andExpect(jsonPath("$.data.confirmed").value(2))
                .andExpect(jsonPath("$.data.pending").value(3)).andExpect(jsonPath("$.data.cancelled").value(1))
                .andExpect(jsonPath("$.data.confirmedRevenue").value(250000));
    }

    @Test
    void exportStreamsAllPagesAsUtf8CsvAndEscapesQuotes() throws Exception {
        when(trips.getS405Trips(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenAnswer(invocation -> {
                    Pageable page = invocation.getArgument(6);
                    List<TripResponse> content = IntStream.range(page.getPageNumber() * 100,
                                    Math.min((page.getPageNumber() + 1) * 100, 101))
                            .mapToObj(i -> TripResponse.builder().id((long) i + 1).busCompanyName("Xe \"A\"")
                                    .originCity("Hà Nội").destinationCity("Huế").status(TripStatus.SCHEDULED)
                                    .totalSeats(10).availableSeats(5).build()).toList();
                    return new PageImpl<>(content, page, 101);
                });
        MvcResult started = mvc.perform(get(ROOT + "/trips/export").with(user("admin").roles("ADMIN"))
                        .param("busCompanyId", "4"))
                .andExpect(request().asyncStarted()).andReturn();
        MvcResult result = mvc.perform(asyncDispatch(started)).andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andExpect(header().string("Content-Disposition", containsString("attachment"))).andReturn();
        String csv = new String(result.getResponse().getContentAsByteArray(), StandardCharsets.UTF_8);
        assertTrue(csv.startsWith("\uFEFF"));
        assertTrue(csv.contains("Xe \"\"A\"\""));
        assertTrue(csv.contains("Hà Nội"));
        assertEquals(102, csv.lines().count(), "header plus 101 filtered rows across two pages");
        verify(trips, times(2)).getS405Trips(any(), eq(4L), any(), any(), any(), any(), any(Pageable.class));
    }
}
