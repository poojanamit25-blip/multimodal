package com.kodexis.core.repository;

import com.kodexis.core.model.Enums;
import com.kodexis.core.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByDifficulty(Enums.Difficulty difficulty);
    List<InterviewQuestion> findByTopic(String topic);
}
