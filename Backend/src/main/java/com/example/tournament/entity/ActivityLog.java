package com.example.tournament.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who performed the action */
    @Column(nullable = false, length = 64)
    private String actorUsername;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ActivityAction action;

    /** The user this action was performed on (nullable — not all actions have a target user) */
    @Column(length = 64)
    private String targetUsername;

    /** Free-text description, e.g. tournament name or old→new role */
    @Column(length = 512)
    private String detail;

    @Column(nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
