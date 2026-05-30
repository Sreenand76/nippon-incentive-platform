package com.nippon.incentive.dto;

import java.math.BigDecimal;
import java.util.List;

public class CalculationResultResponse {

    private Integer totalCars;
    private BigDecimal totalIncentive;
    private List<SalesItemDetail> breakdown;

    public CalculationResultResponse() {
    }

    public CalculationResultResponse(Integer totalCars, BigDecimal totalIncentive,
                                     List<SalesItemDetail> breakdown) {
        this.totalCars = totalCars;
        this.totalIncentive = totalIncentive;
        this.breakdown = breakdown;
    }

    public Integer getTotalCars() {
        return totalCars;
    }

    public void setTotalCars(Integer totalCars) {
        this.totalCars = totalCars;
    }

    public BigDecimal getTotalIncentive() {
        return totalIncentive;
    }

    public void setTotalIncentive(BigDecimal totalIncentive) {
        this.totalIncentive = totalIncentive;
    }

    public List<SalesItemDetail> getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(List<SalesItemDetail> breakdown) {
        this.breakdown = breakdown;
    }

    public static class SalesItemDetail {

        private Long carId;
        private String carModelName;
        private Integer quantity;
        private Long matchedSlabId;
        private BigDecimal incentivePerCar;
        private BigDecimal lineIncentive;
        private boolean lowerTierFallback;

        public SalesItemDetail() {
        }

        public SalesItemDetail(Long carId, String carModelName, Integer quantity,
                               Long matchedSlabId, BigDecimal incentivePerCar,
                               BigDecimal lineIncentive) {
            this.carId = carId;
            this.carModelName = carModelName;
            this.quantity = quantity;
            this.matchedSlabId = matchedSlabId;
            this.incentivePerCar = incentivePerCar;
            this.lineIncentive = lineIncentive;
        }

        public Long getCarId() {
            return carId;
        }

        public void setCarId(Long carId) {
            this.carId = carId;
        }

        public String getCarModelName() {
            return carModelName;
        }

        public void setCarModelName(String carModelName) {
            this.carModelName = carModelName;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Long getMatchedSlabId() {
            return matchedSlabId;
        }

        public void setMatchedSlabId(Long matchedSlabId) {
            this.matchedSlabId = matchedSlabId;
        }

        public BigDecimal getIncentivePerCar() {
            return incentivePerCar;
        }

        public void setIncentivePerCar(BigDecimal incentivePerCar) {
            this.incentivePerCar = incentivePerCar;
        }

        public BigDecimal getLineIncentive() {
            return lineIncentive;
        }

        public void setLineIncentive(BigDecimal lineIncentive) {
            this.lineIncentive = lineIncentive;
        }

        public boolean isLowerTierFallback() {
            return lowerTierFallback;
        }

        public void setLowerTierFallback(boolean lowerTierFallback) {
            this.lowerTierFallback = lowerTierFallback;
        }
    }
}
