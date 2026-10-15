package com.kodexis.core.repository;

import com.kodexis.core.model.InterviewMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewMessageRepository extends JpaRepository<InterviewMessage, Long> {
    List<InterviewMessage> findBySessionIdOrderByTimestampAsc(Long sessionId);
}
