package com.example.tournament.service;

import com.example.tournament.config.FirebaseConfig;
import com.example.tournament.dto.FirebaseLoginRequest;
import com.example.tournament.dto.LoginRequest;
import com.example.tournament.dto.LoginResponse;
import com.example.tournament.dto.SyncRequest;
import com.example.tournament.dto.SyncResponse;
import com.example.tournament.entity.AuthProvider;
import com.example.tournament.entity.FirebaseProvider;
import com.example.tournament.entity.Role;
import com.example.tournament.entity.User;
import com.example.tournament.repository.UserRepository;
import com.example.tournament.security.JwtService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final FirebaseConfig firebaseConfig;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService,
            FirebaseConfig firebaseConfig) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.firebaseConfig = firebaseConfig;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getUsername(), user.getRole().name());
    }

    @Transactional
    public SyncResponse sync(SyncRequest request) {
        requireFirebase();

        FirebaseToken decoded = verifyToken(request.idToken());
        String uid = decoded.getUid();
        String email = decoded.getEmail();
        FirebaseProvider incomingProvider = extractProvider(decoded);

        // 1. Exact match by Firebase UID — returning user
        Optional<User> byUid = userRepository.findByFirebaseUid(uid);
        if (byUid.isPresent()) {
            User user = byUid.get();
            enforceProviderMatch(user.getFirebaseProvider(), incomingProvider);
            return buildSyncResponse(jwtService.generateToken(user.getUsername(), user.getRole()), user);
        }

        // 2. Email collision check — same email, different UID or provider
        if (email != null) {
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                User user = byEmail.get();
                if (user.getAuthProvider() == AuthProvider.DEMO) {
                    throw conflict("This email is associated with a demo account.");
                }
                enforceProviderMatch(user.getFirebaseProvider(), incomingProvider);
                // Same provider, different UID (e.g. account was re-created) — update UID
                user.setFirebaseUid(uid);
                if (request.displayName() != null && user.getDisplayName() == null) {
                    user.setDisplayName(request.displayName());
                }
                userRepository.save(user);
                return buildSyncResponse(jwtService.generateToken(user.getUsername(), user.getRole()), user);
            }
        }

        // 3. New user — create with VIEWER role
        String base = (email != null && email.contains("@")) ? email.split("@")[0] : uid.substring(0, 8);
        String username = makeUniqueUsername(base);
        String displayName = (request.displayName() != null && !request.displayName().isBlank())
                ? request.displayName()
                : username;

        User newUser = userRepository.save(User.builder()
                .username(username)
                .displayName(displayName)
                .firebaseUid(uid)
                .email(email)
                .authProvider(AuthProvider.FIREBASE)
                .firebaseProvider(incomingProvider)
                .role(Role.VIEWER)
                .build());

        return buildSyncResponse(jwtService.generateToken(newUser.getUsername(), newUser.getRole()), newUser);
    }

    /** Kept for backward compatibility; delegates to sync internally. */
    @Transactional
    public LoginResponse firebaseLogin(FirebaseLoginRequest request) {
        SyncResponse sr = sync(new SyncRequest(request.idToken(), null));
        return new LoginResponse(sr.token(), sr.username(), sr.role());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void requireFirebase() {
        if (!firebaseConfig.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Firebase authentication is not configured on this server.");
        }
    }

    private FirebaseToken verifyToken(String idToken) {
        try {
            return FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Firebase ID token.");
        }
    }

    private FirebaseProvider extractProvider(FirebaseToken decoded) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> firebaseClaim = (Map<String, Object>) decoded.getClaims().get("firebase");
            if (firebaseClaim != null && "google.com".equals(firebaseClaim.get("sign_in_provider"))) {
                return FirebaseProvider.GOOGLE;
            }
        } catch (Exception ignored) {}
        return FirebaseProvider.PASSWORD;
    }

    private void enforceProviderMatch(FirebaseProvider stored, FirebaseProvider incoming) {
        if (stored != null && stored != incoming) {
            throw conflict("This email is already registered with another sign-in method. " +
                    "Please use your original login method.");
        }
    }

    private ResponseStatusException conflict(String msg) {
        return new ResponseStatusException(HttpStatus.CONFLICT, msg);
    }

    private SyncResponse buildSyncResponse(String token, User user) {
        return new SyncResponse(
                token,
                user.getUsername(),
                user.getRole().name(),
                user.getEmail(),
                user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(),
                user.getFirebaseProvider() != null ? user.getFirebaseProvider().name() : null);
    }

    private String makeUniqueUsername(String base) {
        if (!userRepository.existsByUsername(base)) return base;
        int i = 2;
        while (userRepository.existsByUsername(base + i)) i++;
        return base + i;
    }
}
