package com.odc.elearning.repository;

import com.odc.elearning.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    List<Quiz> findByCoursIdCours(Integer idCours);
    List<Quiz> findByCoursIdCoursAndEstActifTrue(Integer idCours);
    List<Quiz> findBySectionIdSection(Integer idSection);
    List<Quiz> findByCoursIdCoursAndEstQuizFinalTrue(Integer idCours);
}
