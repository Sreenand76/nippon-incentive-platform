package com.nippon.incentive.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SubmissionResponse {

    private Long id;
    private Integer month;
    private Integer year;
    private Integer totalCars;
    private boolean updated;
	private BigDecimal totalIncentive;
    private LocalDateTime timestamp;
    private List<ItemDetail> items;

    // No-args constructor
    public SubmissionResponse() {
    }

    // All-args constructor
    public SubmissionResponse(Long id, Integer month, Integer year,
                              Integer totalCars,
                              BigDecimal totalIncentive,
                              LocalDateTime timestamp) {
        this.id = id;
        this.month = month;
        this.year = year;
        this.totalCars = totalCars;
        this.totalIncentive = totalIncentive;
        this.timestamp = timestamp;
    }
    
    public static class ItemDetail {
        private String carName;
        private Integer quantity;
        private BigDecimal incentivePerCar;
        private BigDecimal lineIncentive;

        // Getters and Setters
        public String getCarName() { return carName; }
        public void setCarName(String carName) { this.carName = carName; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getIncentivePerCar() { return incentivePerCar; }
        public void setIncentivePerCar(BigDecimal incentivePerCar) { this.incentivePerCar = incentivePerCar; }
        public BigDecimal getLineIncentive() { return lineIncentive; }
        public void setLineIncentive(BigDecimal lineIncentive) { this.lineIncentive = lineIncentive; }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
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
    
    public boolean isUpdated() {
 		return updated;
 	}

 	public void setUpdated(boolean updated) {
 		this.updated = updated;
 	}

 	
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public List<ItemDetail> getItems() { 
    	return items; 
    	}
    public void setItems(List<ItemDetail> items) { 
    	this.items = items;
    	}
}