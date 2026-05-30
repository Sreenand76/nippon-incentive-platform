package com.nippon.incentive.repository;

import com.nippon.incentive.entity.IncentiveSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IncentiveSlabRepository extends JpaRepository<IncentiveSlab, Long> {
    
    @Query("SELECT s FROM IncentiveSlab s WHERE s.carModel.id = :carModelId ORDER BY s.minCars ASC")
    List<IncentiveSlab> findByCarModelIdOrderByMinCarsAsc(@Param("carModelId") Long carModelId);
}
