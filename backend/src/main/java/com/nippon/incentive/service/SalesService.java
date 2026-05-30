package com.nippon.incentive.service;

import com.nippon.incentive.dto.CalculateRequest;
import com.nippon.incentive.dto.CalculationResultResponse;
import com.nippon.incentive.dto.SalesItemRequest;
import com.nippon.incentive.dto.SubmissionResponse;
import com.nippon.incentive.entity.CarModel;
import com.nippon.incentive.entity.IncentiveSlab;
import com.nippon.incentive.entity.SalesSubmission;
import com.nippon.incentive.entity.SalesSubmissionItem;
import com.nippon.incentive.entity.User;
import com.nippon.incentive.repository.CarModelRepository;
import com.nippon.incentive.repository.IncentiveSlabRepository;
import com.nippon.incentive.repository.SalesSubmissionItemRepository;
import com.nippon.incentive.repository.SalesSubmissionRepository;
import com.nippon.incentive.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SalesService {

    @Autowired
    private CarModelRepository carModelRepository;

    @Autowired
    private IncentiveSlabRepository incentiveSlabRepository;

    @Autowired
    private SalesSubmissionRepository salesSubmissionRepository;
    
    @Autowired
    private SalesSubmissionItemRepository salesSubmissionItemRepository;
    
    @Autowired
    private UserRepository userRepository;

    public CalculationResultResponse calculateIncentive(CalculateRequest request) {
        int totalCars = 0;
        BigDecimal totalIncentive = BigDecimal.ZERO;
        List<CalculationResultResponse.SalesItemDetail> breakdown = new ArrayList<>();

        if (request.getItems() != null) {
            for (SalesItemRequest item : request.getItems()) {
                if (item.getQuantity() != null && item.getQuantity() > 0) {
                    CarModel car = carModelRepository.findById(item.getCarId())
                            .orElseThrow(() -> new IllegalArgumentException("Car not found: " + item.getCarId()));

                    int quantity = item.getQuantity();
                    totalCars += quantity;

                    List<IncentiveSlab> modelSlabs =
                            incentiveSlabRepository.findByCarModelIdOrderByMinCarsAsc(car.getId());
                    SlabMatcher.MatchResult match = SlabMatcher.match(quantity, modelSlabs);
                    IncentiveSlab matchedSlab = match.slab();
                    BigDecimal amountPerCar = matchedSlab != null
                            ? matchedSlab.getAmountPerCar()
                            : BigDecimal.ZERO;
                    BigDecimal lineIncentive = amountPerCar.multiply(BigDecimal.valueOf(quantity));
                    totalIncentive = totalIncentive.add(lineIncentive);

                    CalculationResultResponse.SalesItemDetail detail =
                            new CalculationResultResponse.SalesItemDetail(
                                    car.getId(),
                                    formatCarLabel(car),
                                    quantity,
                                    matchedSlab != null ? matchedSlab.getId() : null,
                                    amountPerCar,
                                    lineIncentive);
                    detail.setLowerTierFallback(match.lowerTierFallback());
                    breakdown.add(detail);
                }
            }
        }

        return new CalculationResultResponse(totalCars, totalIncentive, breakdown);
    }

    @Transactional
    public SubmissionResponse saveSubmission(String email, CalculateRequest request) {
        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new IllegalArgumentException("At least one car sale is required");
            }

            if (request.getMonth() == null || request.getMonth() < 1 || request.getMonth() > 12) {
                throw new IllegalArgumentException("Invalid month");
            }

            if (request.getYear() == null || request.getYear() < 2000) {
                throw new IllegalArgumentException("Invalid year");
            }

            CalculationResultResponse calculation;
            try {
                calculation = calculateIncentive(request);
            } catch (Exception e) {
                throw new RuntimeException("Failed to calculate incentive: " + e.getMessage(), e);
            }

            // ── Upsert: find latest existing or create new ──
            List<SalesSubmission> existing;
            try {
                existing = salesSubmissionRepository
                    .findByUserAndMonthAndYear(user, request.getMonth(), request.getYear());
            } catch (Exception e) {
                throw new RuntimeException("Failed to query existing submissions: " + e.getMessage(), e);
            }

            SalesSubmission submission = existing.stream()
                .max(Comparator.comparing(SalesSubmission::getId))
                .orElse(new SalesSubmission());

            boolean isUpdate = submission.getId() != null;

            if (isUpdate) {
                try {
                    submission.getItems().clear();
                    salesSubmissionItemRepository.deleteBySubmission(submission);
                    salesSubmissionItemRepository.flush();
                } catch (Exception e) {
                    throw new RuntimeException("Failed to clear existing submission items: " + e.getMessage(), e);
                }
            }

            submission.setUser(user);
            submission.setMonth(request.getMonth());
            submission.setYear(request.getYear());
            submission.setTotalCars(calculation.getTotalCars());
            submission.setTotalIncentive(calculation.getTotalIncentive());
            submission.setTimestamp(LocalDateTime.now());

            Map<Long, CalculationResultResponse.SalesItemDetail> breakdownByCarId = new HashMap<>();
            if (calculation.getBreakdown() != null) {
                for (CalculationResultResponse.SalesItemDetail detail : calculation.getBreakdown()) {
                    breakdownByCarId.put(detail.getCarId(), detail);
                }
            }

            for (SalesItemRequest item : request.getItems()) {
                if (item.getQuantity() != null && item.getQuantity() > 0) {
                    CarModel car = carModelRepository.findById(item.getCarId())
                        .orElseThrow(() -> new IllegalArgumentException(
                            "Car model not found for id: " + item.getCarId()));

                    CalculationResultResponse.SalesItemDetail detail = breakdownByCarId.get(car.getId());

                    SalesSubmissionItem submissionItem = new SalesSubmissionItem();
                    submissionItem.setSubmission(submission);
                    submissionItem.setCar(car);
                    submissionItem.setQuantity(item.getQuantity());
                    if (detail != null) {
                        submissionItem.setIncentivePerCar(detail.getIncentivePerCar());
                        submissionItem.setLineIncentive(detail.getLineIncentive());
                    } else {
                        submissionItem.setIncentivePerCar(null);
                        submissionItem.setLineIncentive(null);
                    }

                    if (submission.getItems() == null) {
                        throw new RuntimeException("Submission items list is null — check entity initialization");
                    }
                    submission.getItems().add(submissionItem);
                }
            }

            try {
                submission = salesSubmissionRepository.save(submission);
            } catch (Exception e) {
                throw new RuntimeException("Failed to save submission to database: " + e.getMessage(), e);
            }
            
            List<SubmissionResponse.ItemDetail> itemDetails = submission.getItems()
            	    .stream()
            	    .map(item -> {
            	        SubmissionResponse.ItemDetail detail = new SubmissionResponse.ItemDetail();
            	        detail.setCarName(formatCarLabel(item.getCar()));
            	        detail.setQuantity(item.getQuantity());
            	        detail.setIncentivePerCar(item.getIncentivePerCar());
            	        detail.setLineIncentive(item.getLineIncentive());
            	        return detail;
            	    })
            	    .collect(Collectors.toList());
            
            SubmissionResponse res = new SubmissionResponse();
            res.setId(submission.getId());
            res.setMonth(submission.getMonth());
            res.setYear(submission.getYear());
            res.setTotalCars(submission.getTotalCars());
            res.setTotalIncentive(submission.getTotalIncentive());
            res.setTimestamp(submission.getTimestamp());
            res.setUpdated(isUpdate);
            res.setItems(itemDetails);
            return res;

        } catch (IllegalArgumentException e) {
            // Validation errors — pass message directly to frontend
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            // Log the full stack trace so you can see it in Spring Boot console
            e.printStackTrace();
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Failed to save submission: " + e.getMessage()
            );
        }
    }
    
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissions(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return salesSubmissionRepository.findByUserIdOrderByTimestampDesc(user.getId()).stream().map(sub -> {
            SubmissionResponse res = new SubmissionResponse();
            res.setId(sub.getId());
            res.setMonth(sub.getMonth());
            res.setYear(sub.getYear());
            res.setTotalCars(sub.getTotalCars());
            res.setTotalIncentive(sub.getTotalIncentive());
            res.setTimestamp(sub.getTimestamp());

            List<SubmissionResponse.ItemDetail> itemDetails = sub.getItems()
                .stream()
                .map(item -> {
                    SubmissionResponse.ItemDetail detail = new SubmissionResponse.ItemDetail();
                    detail.setCarName(formatCarLabel(item.getCar()));
                    detail.setQuantity(item.getQuantity());
                    detail.setIncentivePerCar(item.getIncentivePerCar());
                    detail.setLineIncentive(item.getLineIncentive());
                    return detail;
                })
                .collect(Collectors.toList());

            res.setItems(itemDetails);
            return res;
        }).collect(Collectors.toList());
    }
    
    private String formatCarLabel(CarModel car) {
        StringBuilder label = new StringBuilder(car.getModelName());
        if (car.getBaseSuffix() != null && !car.getBaseSuffix().isBlank()) {
            label.append(" ").append(car.getBaseSuffix());
        }
        if (car.getVariant() != null && !car.getVariant().isBlank()) {
            label.append(" ").append(car.getVariant());
        }
        return label.toString();
    }
}
