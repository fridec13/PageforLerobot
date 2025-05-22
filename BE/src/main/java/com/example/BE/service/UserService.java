package com.example.BE.service;

import com.example.BE.entity.User;
import com.example.BE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor          // userRepository, passwordEncoder 모두 자동 주입
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("이미 가입된 이메일입니다.");
        }
        // ★ 평문 비밀번호 → BCrypt 해시
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}
