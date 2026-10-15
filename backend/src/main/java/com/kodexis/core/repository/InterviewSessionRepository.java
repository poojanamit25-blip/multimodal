package com.kodexis.core.repository;

import com.kodexis.core.model.InterviewSession;
import com.kodexis.core.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUserOrderByStartedAtDesc(User user);
    List<InterviewSession> findByUserIdOrderByStartedAtDesc(Long userId);
}
