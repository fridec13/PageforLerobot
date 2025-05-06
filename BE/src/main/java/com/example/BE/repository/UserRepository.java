package com.example.BE.repository;

import com.example.BE.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;       // ★ 추가

public interface UserRepository extends JpaRepository<User, Long> {

    /* 이메일 중복 체크 + 로그인용 조회에 모두 사용 */
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);   // 이미 있으면 OK, 없으면 함께 추가
}
