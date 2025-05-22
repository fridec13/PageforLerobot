package com.example.BE.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration // 스프링 설정 클래스임을 표시
public class SecurityBeans {
//    비번을 BCrypt 로 암호화 해주는 Bean
    @Bean // @Bean 메서드는 애플리케이션 전체에서 주입(inject)해 쓸 수 있는 객체 등록
    public PasswordEncoder passwordEncoder() { // Bean 하나만 먼저 두면, 나중에 회원가입,로그인 로직에서 passwordEncoder.encode() / matches() 를 바로 사용 가능
        return new BCryptPasswordEncoder();
    }
}