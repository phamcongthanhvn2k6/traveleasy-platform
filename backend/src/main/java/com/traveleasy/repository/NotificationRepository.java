package com.traveleasy.repository;

import com.traveleasy.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE " +
            "(:email IS NOT NULL AND n.recipientEmail = :email) OR " +
            "(:role IS NOT NULL AND (n.targetRole = :role OR n.targetRole = 'ALL')) " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findForUser(@Param("email") String email, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM Notification n WHERE " +
            "((:email IS NOT NULL AND n.recipientEmail = :email) OR " +
            "(:role IS NOT NULL AND (n.targetRole = :role OR n.targetRole = 'ALL'))) " +
            "AND n.isRead = false")
    long countUnreadForUser(@Param("email") String email, @Param("role") String role);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE " +
            "(:email IS NOT NULL AND n.recipientEmail = :email) OR " +
            "(:role IS NOT NULL AND (n.targetRole = :role OR n.targetRole = 'ALL'))")
    void markAllAsReadForUser(@Param("email") String email, @Param("role") String role);
}
