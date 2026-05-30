package com.nippon.incentive.dto;

import lombok.Data;

public class SalesItemRequest {

    private Long carId;
    private Integer quantity;

    // No-args constructor
    public SalesItemRequest() {
    }

    // All-args constructor
    public SalesItemRequest(Long carId, Integer quantity) {
        this.carId = carId;
        this.quantity = quantity;
    }

    // Getters and Setters
    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}