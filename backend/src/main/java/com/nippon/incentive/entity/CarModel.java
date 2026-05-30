package com.nippon.incentive.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "car_models")
public class CarModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String modelName;

    private String baseSuffix;

    private String variant;

    @Column(nullable = false)
    private boolean active = true;

    // No-args constructor
    public CarModel() {
    }

    // All-args constructor
    public CarModel(Long id, String modelName, String baseSuffix, String variant, boolean active) {
        this.id = id;
        this.modelName = modelName;
        this.baseSuffix = baseSuffix;
        this.variant = variant;
        this.active = active;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getBaseSuffix() {
        return baseSuffix;
    }

    public void setBaseSuffix(String baseSuffix) {
        this.baseSuffix = baseSuffix;
    }

    public String getVariant() {
        return variant;
    }

    public void setVariant(String variant) {
        this.variant = variant;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}