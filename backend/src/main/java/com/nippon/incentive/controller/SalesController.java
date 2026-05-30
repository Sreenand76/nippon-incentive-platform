package com.nippon.incentive.controller;

import com.nippon.incentive.dto.CalculateRequest;
import com.nippon.incentive.dto.CalculationResultResponse;
import com.nippon.incentive.dto.SubmissionResponse;
import com.nippon.incentive.entity.CarModel;
import com.nippon.incentive.entity.IncentiveSlab;
import com.nippon.incentive.service.AdminService;
import com.nippon.incentive.service.SalesService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
public class SalesController {

    @Autowired
    private SalesService salesService;

    @Autowired
    private AdminService adminService; // Reuse to get active cars/slabs

    @GetMapping("/cars")
    public List<CarModel> getActiveCars() {
        return adminService.getAllCars().stream()
                .filter(CarModel::isActive)
                .collect(Collectors.toList());
    }

    @GetMapping("/slabs")
    public List<IncentiveSlab> getAllSlabs() {
        return adminService.getAllSlabs();
    }

    @PostMapping("/calculate")
    public CalculationResultResponse calculate(@RequestBody CalculateRequest request) {
        return salesService.calculateIncentive(request);
    }

    @PostMapping("/submissions")
    public SubmissionResponse saveSubmission(@RequestBody CalculateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return salesService.saveSubmission(email, request);
    }

    @GetMapping("/submissions")
    public List<SubmissionResponse> getSubmissions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return salesService.getSubmissions(email);
    }
}
