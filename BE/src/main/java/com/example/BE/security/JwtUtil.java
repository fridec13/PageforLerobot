package com.example.BE.security;

import io.jsonwebtoken.*; // JWT 토큰 생성, 파싱용 라이브러리
import io.jsonwebtoken.security.Keys; // 안전한 SecretKey 생성 도우미?
import org.springframework.stereotype.Component;
import java.security.Key; // java.security 패키지의 Key 인터페이스
import java.util.Date;

@Component // Spring 빈 으로 등록
public class JwtUtil {
    // HS256 알고리즘용 256bit 랜덤 비밀키 생성 (애플리케이션 실행마다 새로 만듦)
    private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // 토큰 만료 시간을 1시간으로 설정
    private final long EXP_MS = 1000 * 60 * 60;


    // 토큰생성
    public String generateToken(String email) {
        return Jwts.builder() // 토큰 builder 시작
                .setSubject(email) // email 을 기준 잡아보고
                .setIssuedAt(new Date()) // 발급한 시간임
                .setExpiration(new Date(System.currentTimeMillis() + EXP_MS)) // 만료시간
                .signWith(secretKey) // 결재 secretKey로
                .compact(); // 최종 문자열 생성
    }

    public String getEmail(String token) {
        return Jwts.parserBuilder() // parserBuilder 이게 뭐누, 빈둥거리는 건축가?
                .setSigningKey(secretKey)// 검증용 키 설정
                .build()// parser 객체 생성
                .parseClaimsJws(token)// 서명?(결재), 만료 등 검증 + 파싱
                .getBody() // payload 꺼내고,
                .getSubject(); // sub(email) 반환
    }

    // 토큰 유효성 검증
    public boolean isTokenValid(String token) {
        try {
            getEmail(token); // 파싱(문장의 분석)이 성공하면 유효
            return true;
        } catch (JwtException | IllegalArgumentException e){
            return false;
        }
    }
}