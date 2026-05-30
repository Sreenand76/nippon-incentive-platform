package com.nippon.incentive.repository;

import com.nippon.incentive.entity.SalesSubmission;
import com.nippon.incentive.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalesSubmissionRepository extends JpaRepository<SalesSubmission, Long> {
    List<SalesSubmission> findByUserIdOrderByTimestampDesc(Long userId);
    List<SalesSubmission> findByUserAndMonthAndYear(User user, Integer month, Integer year);
   
}
