package com.kodexis.core.repository;

import com.kodexis.core.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByQuestionId(Long questionId);
}
