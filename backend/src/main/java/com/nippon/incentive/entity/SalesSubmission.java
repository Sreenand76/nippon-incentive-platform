package com.nippon.incentive.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_submissions" ,uniqueConstraints = {
	    @UniqueConstraint(columnNames = {"user_id", "month", "year"})
	})
public class SalesSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer month; // 1-12

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer totalCars;

    @Column(nullable = false)
    private BigDecimal totalIncentive;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesSubmissionItem> items = new ArrayList<>();

    // No-args constructor
    public SalesSubmission() {
    }

    // All-args constructor
    public SalesSubmission(Long id, User user, Integer month, Integer year,
                           Integer totalCars, BigDecimal totalIncentive,
                           LocalDateTime timestamp, List<SalesSubmissionItem> items) {
        this.id = id;
        this.user = user;
        this.month = month;
        this.year = year;
        this.totalCars = totalCars;
        this.totalIncentive = totalIncentive;
        this.timestamp = timestamp;
        this.items = items;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public List<SalesSubmissionItem> getItems() {
        return items;
    }

    public void setItems(List<SalesSubmissionItem> items) {
        this.items = items;
    }
}