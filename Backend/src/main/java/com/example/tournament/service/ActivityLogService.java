package com.example.tournament.service;

import com.example.tournament.entity.ActivityAction;
import com.example.tournament.entity.ActivityLog;
import com.example.tournament.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repo;

    public ActivityLogService(ActivityLogRepository repo) {
        this.repo = repo;
    }

    /**
     * Persist a new log entry.
     * Uses REQUIRES_NEW so a log write never rolls back the parent transaction,
     * and parent failures don't prevent the log from being written.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String actor, ActivityAction action, String target, String detail) {
        repo.save(ActivityLog.builder()
                .actorUsername(actor)
                .action(action)
                .targetUsername(target)
                .detail(detail)
                .build());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findRecent() {
        return repo.findTop100ByOrderByCreatedAtDesc().stream().map(e -> {
            java.util.LinkedHashMap<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id",             e.getId());
            m.put("actorUsername",  e.getActorUsername());
            m.put("action",         e.getAction().name());
            m.put("targetUsername", e.getTargetUsername() != null ? e.getTargetUsername() : "");
            m.put("detail",         e.getDetail() != null ? e.getDetail() : "");
            m.put("createdAt",      e.getCreatedAt().toString());
            return (Map<String, Object>) m;
        }).toList();
    }
}
