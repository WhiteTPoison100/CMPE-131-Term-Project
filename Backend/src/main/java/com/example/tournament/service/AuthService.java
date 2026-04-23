package com.example.tournament.service;

import com.example.tournament.config.FirebaseConfig;
import com.example.tournament.dto.FirebaseLoginRequest;
import com.example.tournament.dto.LoginRequest;
import com.example.tournament.dto.LoginResponse;
import com.example.tournament.entity.AuthProvider;
import com.example.tournament.entity.Role;
import com.example.tournament.entity.User;
import com.example.tournament.repository.UserRepository;
import com.example.tournament.security.JwtService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
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
        Authentication auth =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getUsername(), user.getRole().name());
    }

    @Transactional
    public LoginResponse firebaseLogin(FirebaseLoginRequest request) {
        if (!firebaseConfig.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Firebase authentication is not configured on this server.");
        }
        try {
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(request.idToken());
            String uid = decoded.getUid();
            String email = decoded.getEmail();
            String name = decoded.getName() != null ? decoded.getName() : email;

            User user = userRepository.findByFirebaseUid(uid).orElseGet(() -> {
                String username = email.contains("@") ? email.split("@")[0] : email;
                String safeUsername = makeUniqueUsername(username);
                return userRepository.save(User.builder()
                        .username(safeUsername)
                        .firebaseUid(uid)
                        .email(email)
                        .authProvider(AuthProvider.FIREBASE)
                        .role(Role.VIEWER)
                        .build());
            });

            String token = jwtService.generateToken(user.getUsername(), user.getRole());
            return new LoginResponse(token, user.getUsername(), user.getRole().name());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Firebase token: " + e.getMessage());
        }
    }

    private String makeUniqueUsername(String base) {
        if (!userRepository.existsByUsername(base)) return base;
        int i = 2;
        while (userRepository.existsByUsername(base + i)) i++;
        return base + i;
    }
}
