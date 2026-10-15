package com.kodexis.core.repository;

import com.kodexis.core.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findBySessionIdOrderBySubmittedAtDesc(Long sessionId);
}
