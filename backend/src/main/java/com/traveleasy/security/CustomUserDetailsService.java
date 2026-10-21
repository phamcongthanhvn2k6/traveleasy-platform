package com.traveleasy.security;

import com.traveleasy.entity.User;
import com.traveleasy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với: " + identifier));

        boolean isNotLocked = !"LOCKED".equalsIgnoreCase(user.getStatus());
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                isNotLocked,
                true,
                true,
                isNotLocked,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
