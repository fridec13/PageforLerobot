package com.example.BE.controller;

import com.example.BE.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")   // FE 개발 서버
public class AuthController {

    private final AuthenticationManager authManager;  // SecurityConfig에서 Bean 등록
    private final JwtUtil jwtUtil;                    // 토큰 생성 도우미

    /**
     * 로그인 & JWT 발급
     */
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginDto dto) {

        // 1) 이메일·비밀번호 인증 (실패 시 예외 발생 → 401)
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.getEmail(), dto.getPassword()));

        // 2) 인증 성공 → 토큰 생성
        String token = jwtUtil.generateToken(dto.getEmail());

        // 3) JSON 형식으로 반환 (프론트는 { token: "..." } 받음)
        return Map.of("token", token);
    }
}

/* ====== 요청 바디용 DTO ====== */
@Getter @Setter
class LoginDto {
    private String email;
    private String password;
}
