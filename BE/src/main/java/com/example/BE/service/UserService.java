package com.example.BE.service;

import com.example.BE.entity.User;
import com.example.BE.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("이미 가입된 이메일입니다.");
        }
        return userRepository.save(user);
    }
}
