package com.example.tournament.security;

import com.example.tournament.entity.Role;
import com.example.tournament.entity.User;
import com.example.tournament.repository.UserRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
        String role = "ROLE_" + u.getRole().name();
        return new org.springframework.security.core.userdetails.User(
                u.getUsername(), u.getPassword(), List.of(new SimpleGrantedAuthority(role)));
    }

    public Role loadRole(String username) {
        return userRepository.findByUsername(username).map(User::getRole).orElse(Role.VIEWER);
    }
}
