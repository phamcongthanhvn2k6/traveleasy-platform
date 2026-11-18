package com.traveleasy.integration;

import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.BusType;
import com.traveleasy.entity.Route;
import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.RouteRepository;
import com.traveleasy.repository.TripRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceContext;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * [S412] Kiểm thử tối ưu câu truy vấn SQL tìm chuyến: Khử triệt để N+1 Queries bằng @EntityGraph.
 * Bật Hibernate Statistics & SQL Logging xác nhận chỉ thực thi duy nhất 1 câu SELECT khi nạp busCompany và route.
 * @author Phạm Thanh Phong
 */
@SpringBootTest(properties = {
        "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.jpa.show-sql=true"
})
@ActiveProfiles("test")
@Transactional
public class S412EntityGraphQueryOptimizationTest {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BusCompanyRepository busCompanyRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @PersistenceContext
    private EntityManager entityManager;

    private Statistics getHibernateStatistics() {
        SessionFactory sessionFactory = entityManagerFactory.unwrap(SessionFactory.class);
        Statistics stats = sessionFactory.getStatistics();
        stats.setStatisticsEnabled(true);
        return stats;
    }

    private void seedMultipleCompaniesAndTrips() {
        for (int i = 1; i <= 5; i++) {
            BusCompany company = busCompanyRepository.save(BusCompany.builder()
                    .name("Nhà Xe S412 Số " + i)
                    .hotline("1900100" + i)
                    .status("ACTIVE")
                    .averageRating(BigDecimal.valueOf(4.8))
                    .build());

            Route route = routeRepository.save(Route.builder()
                    .busCompany(company)
                    .departureLocation("TP. Hồ Chí Minh")
                    .arrivalLocation("Đà Lạt " + i)
                    .distanceKm(BigDecimal.valueOf(300))
                    .durationHours(BigDecimal.valueOf(6))
                    .build());

            tripRepository.save(Trip.builder()
                    .busCompany(company)
                    .route(route)
                    .departureTime(LocalDateTime.now().plusDays(2).withHour(7 + i).withMinute(0))
                    .arrivalTime(LocalDateTime.now().plusDays(2).withHour(13 + i).withMinute(0))
                    .busType(BusType.LIMOUSINE)
                    .price(BigDecimal.valueOf(350000))
                    .totalSeats(34)
                    .availableSeats(34)
                    .status(TripStatus.SCHEDULED)
                    .build());
        }
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("[S412] searchTrips nạp sẵn busCompany và route trong đúng 1 câu SQL SELECT duy nhất (0 N+1 Queries)")
    void testSearchTrips_EliminatesNPlusOneQueriesWithEntityGraph() {
        seedMultipleCompaniesAndTrips();
        Statistics stats = getHibernateStatistics();
        stats.clear();

        List<Trip> trips = tripRepository.searchTrips(
                "TP. Hồ Chí Minh",
                "Đà Lạt",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(3),
                TripStatus.SCHEDULED
        );

        assertTrue(trips.size() >= 5, "Phải truy vấn được ít nhất 5 chuyến xe từ 5 nhà xe khác nhau");

        // Duyệt toàn bộ danh sách và truy cập sâu busCompany & route — nếu có N+1 sẽ phát sinh thêm 10 câu SELECT
        for (Trip trip : trips) {
            assertNotNull(trip.getBusCompany().getName());
            assertNotNull(trip.getRoute().getDepartureLocation());
            assertNotNull(trip.getRoute().getArrivalLocation());
        }

        long statementCount = stats.getPrepareStatementCount();
        assertEquals(1L, statementCount,
                "Kỳ vọng đúng 1 câu SQL SELECT nhờ @EntityGraph(attributePaths = {\"busCompany\", \"route\"}), thực tế: " + statementCount);
    }

    @Test
    @DisplayName("[S412] findAllByOrderByDepartureTimeDesc & findAll nạp sẵn busCompany và route trong 1 câu SQL")
    void testFindAllTrips_EliminatesNPlusOneQueriesWithEntityGraph() {
        seedMultipleCompaniesAndTrips();
        Statistics stats = getHibernateStatistics();
        stats.clear();

        List<Trip> trips = tripRepository.findAll();
        assertTrue(trips.size() >= 5);

        for (Trip trip : trips) {
            assertNotNull(trip.getBusCompany().getName());
            assertNotNull(trip.getRoute().getArrivalLocation());
        }

        assertEquals(1L, stats.getPrepareStatementCount(),
                "findAll() phải nạp sẵn busCompany & route chỉ với 1 câu SQL SELECT");
    }
}
