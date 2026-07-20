package com.odc.elearning.repository;

import com.odc.elearning.entity.ReponseApprenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReponseApprenantRepository extends JpaRepository<ReponseApprenant, Integer> {
    List<ReponseApprenant> findByTentativeIdTentative(Integer idTentative);
}
