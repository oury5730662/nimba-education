package com.odc.elearning.repository;

import com.odc.elearning.entity.Reponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReponseRepository extends JpaRepository<Reponse, Integer> {
    List<Reponse> findByQuestionIdQuestionOrderByOrdreAsc(Integer idQuestion);
    List<Reponse> findByQuestionIdQuestionAndEstCorrecteTrue(Integer idQuestion);
}
