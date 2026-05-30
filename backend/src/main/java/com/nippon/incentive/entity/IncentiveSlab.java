package com.nippon.incentive.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "incentive_slabs")
public class IncentiveSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;

    @Column(nullable = false)
    private Integer minCars;

    @Column(nullable = true)
    private Integer maxCars;

    @Column(nullable = false)
    private BigDecimal amountPerCar;

    // No-args constructor
    public IncentiveSlab() {
    }

    // All-args constructor
    public IncentiveSlab(Long id, CarModel carModel, Integer minCars, Integer maxCars, BigDecimal amountPerCar) {
        this.id = id;
        this.carModel = carModel;
        this.minCars = minCars;
        this.maxCars = maxCars;
        this.amountPerCar = amountPerCar;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CarModel getCarModel() {
        return carModel;
    }

    public void setCarModel(CarModel carModel) {
        this.carModel = carModel;
    }

    public Integer getMinCars() {
        return minCars;
    }

    public void setMinCars(Integer minCars) {
        this.minCars = minCars;
    }

    public Integer getMaxCars() {
        return maxCars;
    }

    public void setMaxCars(Integer maxCars) {
        this.maxCars = maxCars;
    }

    public BigDecimal getAmountPerCar() {
        return amountPerCar;
    }

    public void setAmountPerCar(BigDecimal amountPerCar) {
        this.amountPerCar = amountPerCar;
    }
}