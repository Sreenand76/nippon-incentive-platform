package com.nippon.incentive.dto;

import lombok.Data;
import java.util.List;

public class CalculateRequest {

    private Integer month;
    private Integer year;
    private List<SalesItemRequest> items;

    public CalculateRequest() {
    }

    public CalculateRequest(Integer month, Integer year, List<SalesItemRequest> items) {
        this.month = month;
        this.year = year;
        this.items = items;
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

    public List<SalesItemRequest> getItems() {
        return items;
    }

    public void setItems(List<SalesItemRequest> items) {
        this.items = items;
    }
}