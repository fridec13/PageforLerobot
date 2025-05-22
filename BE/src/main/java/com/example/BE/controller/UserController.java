package com.example.BE.controller;

import com.example.BE.entity.User;
import com.example.BE.repository.UserRepository;
import com.example.BE.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor                                   // Lombok으로 생성자 자동 생성
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    /* 회원가입 */
    @PostMapping("/signup")
    public User signup(@RequestBody User user) {
        return userService.register(user);
    }

    /* 로그인한 사용자 정보 */
    @GetMapping("/me")
    public User me(Authentication authentication) {
        // 현재 로그인한 사용자의 이메일
        String email = authentication.getName();           //  getName()

        // 이메일로 DB 조회
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
