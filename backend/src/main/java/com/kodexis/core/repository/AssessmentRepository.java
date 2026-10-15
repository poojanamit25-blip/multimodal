package com.kodexis.core.repository;

import com.kodexis.core.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    Optional<Assessment> findBySessionId(Long sessionId);
}
