package com.traveleasy.integration;

import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import com.traveleasy.service.admin.AdminTripService;
import com.traveleasy.service.customer.BookingService;
import com.traveleasy.service.customer.TripService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/** Isolated H2 integration coverage for S405 database paging and mapping. */
@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:s405query;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.jpa.show-sql=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class S405QueryIntegrationTest {
    @Autowired EntityManager em;
    @Autowired EntityManagerFactory emf;
    @Autowired TripRepository trips;
    @Autowired BookingRepository bookings;
    @Autowired TicketRepository tickets;
    @Autowired PickupDropoffPointRepository points;
    @Autowired CompanyPricingRuleRepository rules;

    private AdminTripService tripService;
    private BookingService bookingService;
    private Long companyId;
    private Long routeId;
    private final List<Long> tripIds = new ArrayList<>();
    private final List<Long> bookingIds = new ArrayList<>();
    private static final LocalDateTime DAY = LocalDateTime.of(2026, 11, 20, 0, 0);

    @BeforeEach
    void seed() {
        BusCompany a = BusCompany.builder().name("Fixture 100%_! Bus").hotline("fixture-a").build();
        BusCompany b = BusCompany.builder().name("Fixture 100xy Bus").hotline("fixture-b").build();
        em.persist(a); em.persist(b);
        Route routeA = Route.builder().busCompany(a).departureLocation("Origin A")
                .arrivalLocation("Destination A").durationHours(BigDecimal.ONE).build();
        Route routeB = Route.builder().busCompany(b).departureLocation("Origin B")
                .arrivalLocation("Destination B").durationHours(BigDecimal.ONE).build();
        em.persist(routeA); em.persist(routeB);
        companyId = a.getId(); routeId = routeA.getId();
        for (int i = 0; i < 16; i++) {
            // Explicitly cover the instant before, at and after the selected day.
            LocalDateTime departure = i == 0 ? DAY.minusNanos(1000)
                    : i == 1 ? DAY : i == 2 ? DAY.plusDays(1).minusNanos(1000)
                    : i == 3 ? DAY.plusDays(1) : DAY.plusHours(12);
            boolean firstCompany = i < 12;
            Trip trip = Trip.builder().busCompany(firstCompany ? a : b).route(firstCompany ? routeA : routeB)
                    .departureTime(departure).arrivalTime(departure.plusHours(1))
                    .price(BigDecimal.valueOf(100000)).totalSeats(30).availableSeats(25)
                    .status(TripStatus.values()[i % TripStatus.values().length]).isActive(i != 4).build();
            em.persist(trip); tripIds.add(trip.getId());
            for (int j = 0; j < 2; j++) {
                int n = i * 2 + j;
                Booking booking = Booking.builder().trip(trip).bookingCode("FIX-" + n)
                        .passengerName(n == 2 ? "Fixture 100%_!" : "Fixture passenger " + n)
                        .passengerPhone("fixture-" + n).passengerEmail("fixture" + n + "@example.invalid")
                        .seatNumbers("A01").totalAmount(BigDecimal.valueOf(100000))
                        .createdAt(DAY).status(BookingStatus.values()[n % BookingStatus.values().length]).build();
                em.persist(booking); bookingIds.add(booking.getId());
                em.persist(Ticket.builder().booking(booking).ticketCode("TICKET-" + n)
                        .seatNumber("A01").price(BigDecimal.valueOf(100000)).build());
            }
        }
        em.flush(); em.clear();
        TripService mapper = new TripService(trips, null, points, null, null, null, null, rules);
        tripService = new AdminTripService(trips, null, null, null, bookings, null, points, rules, mapper);
        bookingService = new BookingService(bookings, tickets, trips, null, points, null, null,
                mapper, null, null, null);
        ReflectionTestUtils.setField(bookingService, "s405PricingRuleRepository", rules);
    }

    @Test
    void pagesHaveCorrectTotalsStableOrderAndIncludeSoftDeleted() {
        var page0 = tripService.getS405Trips(null, null, null, null, null, null, PageRequest.of(0, 5));
        var page1 = tripService.getS405Trips(null, null, null, null, null, null, PageRequest.of(1, 5));
        assertEquals(16, page0.getTotalElements());
        assertEquals(4, page0.getTotalPages());
        assertEquals(5, page0.getNumberOfElements());
        Set<Long> distinct = new HashSet<>();
        for (int p = 0; p < 4; p++) {
            var page = tripService.getS405Trips(null, null, null, null, null, null, PageRequest.of(p, 5));
            page.forEach(t -> assertTrue(distinct.add(t.getId()), "duplicate trip across pages"));
        }
        assertEquals(new HashSet<>(tripIds), distinct);
        assertEquals(page1.getContent().get(0).getId(), tripService.getS405Trips(null, null, null, null, null, null, PageRequest.of(1, 5)).getContent().get(0).getId());

        Set<Long> bookingDistinct = new HashSet<>();
        for (int p = 0; p < 7; p++) {
            var page = bookingService.getS405BookingPage(null, null, null, null, null, null, PageRequest.of(p, 5));
            assertEquals(32, page.getTotalElements());
            assertEquals(7, page.getTotalPages());
            page.forEach(x -> { assertTrue(bookingDistinct.add(x.getId())); assertEquals(1, x.getTickets().size()); });
        }
        assertEquals(new HashSet<>(bookingIds), bookingDistinct);
        assertEquals(bookingIds.get(31), bookingService.getS405BookingPage(null, null, null, null, null, null, PageRequest.of(0, 5)).getContent().get(0).getId());
    }

    @Test
    void inclusiveDayBoundsFiltersAndEnums() {
        var page = tripService.getS405Trips(null, companyId, routeId, DAY, DAY.plusDays(1), null, PageRequest.of(0, 100));
        assertEquals(10, page.getTotalElements()); // [0, 12) except before-start and next-day
        Set<Long> ids = new HashSet<>(page.map(x -> x.getId()).getContent());
        assertTrue(ids.contains(tripIds.get(1)));
        assertTrue(ids.contains(tripIds.get(2)));
        assertFalse(ids.contains(tripIds.get(0)));
        assertFalse(ids.contains(tripIds.get(3)));
        assertEquals(20, bookingService.getS405BookingPage(null, companyId, routeId, DAY, DAY.plusDays(1), null, PageRequest.of(0, 100)).getTotalElements());
        for (TripStatus status : TripStatus.values()) {
            long expected = java.util.stream.IntStream.range(0, 16).filter(i -> TripStatus.values()[i % TripStatus.values().length] == status).count();
            assertEquals(expected, tripService.getS405Trips(null, null, null, null, null, status, PageRequest.of(0, 100)).getTotalElements());
        }
        for (BookingStatus status : BookingStatus.values()) {
            assertEquals(8, bookingService.getS405BookingPage(null, null, null, null, null, status, PageRequest.of(0, 100)).getTotalElements());
        }
        var combined = tripService.getS405Trips("origin a", companyId, routeId, DAY, DAY.plusDays(1), TripStatus.DEPARTED, PageRequest.of(0, 100));
        assertEquals(3, combined.getTotalElements());
        assertEquals(0, tripService.getS405Trips(null, companyId, Long.MAX_VALUE, null, null, null, PageRequest.of(0, 5)).getTotalElements());
    }

    @Test
    void searchTreatsPercentUnderscoreAndEscapeCharacterAsLiterals() {
        for (String q : List.of("%", "_", "!", "100%_!")) {
            assertEquals(12, tripService.getS405Trips(q, null, null, null, null, null, PageRequest.of(0, 100)).getTotalElements(), q);
            assertEquals(1, bookingService.getS405BookingPage(q, null, null, null, null, null, PageRequest.of(0, 100)).getTotalElements(), q);
        }
        assertEquals(1, bookingService.getS405BookingPage("FIX-2", null, null, null, null, null, PageRequest.of(0, 100)).getContent().stream().filter(b -> b.getBookingCode().equals("FIX-2")).count());
    }

    @Test
    void serviceQueryCountIsBoundedAcrossDifferentPageSizes() {
        Statistics stats = emf.unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);
        em.flush(); em.clear(); stats.clear();
        var small = bookingService.getS405BookingPage(null, null, null, null, null, null, PageRequest.of(0, 2));
        long smallCount = stats.getPrepareStatementCount();
        assertEquals(2, small.getNumberOfElements());
        em.clear(); stats.clear();
        var large = bookingService.getS405BookingPage(null, null, null, null, null, null, PageRequest.of(0, 12));
        long largeCount = stats.getPrepareStatementCount();
        assertEquals(12, large.getNumberOfElements());
        assertTrue(largeCount <= smallCount + 1, "SQL statements must not grow per booking: small=" + smallCount + ", large=" + largeCount);
        assertTrue(largeCount <= 6, "Expected page, count and batch queries only, got " + largeCount);
        em.clear(); stats.clear();
        assertEquals(12, tripService.getS405Trips(null, null, null, null, null, null, PageRequest.of(0, 12)).getNumberOfElements());
        assertTrue(stats.getPrepareStatementCount() <= 2, "Trip mapping must not issue per-row SQL");
    }
}
