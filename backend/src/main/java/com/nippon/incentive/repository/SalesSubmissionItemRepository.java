package com.nippon.incentive.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nippon.incentive.entity.SalesSubmission;
import com.nippon.incentive.entity.SalesSubmissionItem;

public interface SalesSubmissionItemRepository extends JpaRepository<SalesSubmissionItem, Long> {
    boolean existsByCar_Id(Long carId);
    void deleteBySubmission(SalesSubmission submission);
}