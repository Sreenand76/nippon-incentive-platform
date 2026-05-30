package com.nippon.incentive.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "sales_submission_items")
public class SalesSubmissionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private SalesSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private CarModel car;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal incentivePerCar = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal lineIncentive = BigDecimal.ZERO;

    // No-args constructor
    public SalesSubmissionItem() {
    }

    // All-args constructor
    public SalesSubmissionItem(Long id, SalesSubmission submission,
                               CarModel car, Integer quantity) {
        this.id = id;
        this.submission = submission;
        this.car = car;
        this.quantity = quantity;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SalesSubmission getSubmission() {
        return submission;
    }

    public void setSubmission(SalesSubmission submission) {
        this.submission = submission;
    }

    public CarModel getCar() {
        return car;
    }

    public void setCar(CarModel car) {
        this.car = car;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
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
}