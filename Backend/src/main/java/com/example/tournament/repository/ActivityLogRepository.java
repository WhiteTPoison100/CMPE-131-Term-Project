package com.example.tournament.repository;

import com.example.tournament.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /** Most-recent 100 events, newest first */
    List<ActivityLog> findTop100ByOrderByCreatedAtDesc();
}
