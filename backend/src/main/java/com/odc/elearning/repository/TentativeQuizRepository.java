package com.odc.elearning.repository;

import com.odc.elearning.entity.TentativeQuiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TentativeQuizRepository extends JpaRepository<TentativeQuiz, Integer> {
    List<TentativeQuiz> findByUtilisateurIdUtilisateurAndQuizIdQuiz(Integer idUtilisateur, Integer idQuiz);
    List<TentativeQuiz> findByUtilisateurIdUtilisateur(Integer idUtilisateur);
    long countByUtilisateurIdUtilisateurAndQuizIdQuiz(Integer idUtilisateur, Integer idQuiz);
    Optional<TentativeQuiz> findTopByUtilisateurIdUtilisateurAndQuizIdQuizOrderByScoreObtenuDesc(
            Integer idUtilisateur, Integer idQuiz);
}
