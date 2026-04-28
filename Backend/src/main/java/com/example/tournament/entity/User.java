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

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String username;

    @Column
    private String password;

    @Column(length = 256)
    private String displayName;

    @Column(length = 256, unique = true)
    private String email;

    @Column(length = 128, unique = true)
    private String firebaseUid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16, columnDefinition = "VARCHAR(16) NOT NULL DEFAULT 'DEMO'")
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.DEMO;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private FirebaseProvider firebaseProvider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Role role;

    /**
     * Username of the TO who promoted this user to TO role.
     * Null for original/seed organizers.
     * Used to prevent a newly-promoted TO from demoting their promoter.
     */
    @Column(length = 64)
    private String promotedBy;

    /** Firebase Storage CDN URL for the user's profile photo. */
    @Column(length = 512)
    private String photoUrl;

    /**
     * When false the account is deactivated (soft-deleted).
     * The user cannot log in and their profile is hidden.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
