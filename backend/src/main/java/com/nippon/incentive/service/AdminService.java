package com.nippon.incentive.service;

import com.nippon.incentive.entity.CarModel;
import com.nippon.incentive.entity.IncentiveSlab;
import com.nippon.incentive.repository.CarModelRepository;
import com.nippon.incentive.repository.IncentiveSlabRepository;
import com.nippon.incentive.repository.SalesSubmissionItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private CarModelRepository carModelRepository;

    @Autowired
    private IncentiveSlabRepository incentiveSlabRepository;
    
    @Autowired
    private SalesSubmissionItemRepository salesSubmissionItemRepository;

    public List<CarModel> getAllCars() {
        return carModelRepository.findAll();
    }

    @Transactional
    public CarModel saveCar(CarModel carModel) {
        return carModelRepository.save(carModel);
    }

    public void deleteCar(Long id) {
        CarModel car = carModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        boolean usedInSubmissions =
                salesSubmissionItemRepository.existsByCar_Id(id);

        if (usedInSubmissions) {
            throw new IllegalStateException(
                    "Car model is used in past submissions"
            );
        }

        carModelRepository.delete(car);
    }

    public List<IncentiveSlab> getAllSlabs() {
        return incentiveSlabRepository.findAll();
    }

    public List<IncentiveSlab> getSlabsByCarModel(Long carModelId) {
        return incentiveSlabRepository.findByCarModelIdOrderByMinCarsAsc(carModelId);
    }

    @Transactional
    public IncentiveSlab saveSlab(IncentiveSlab slab) {
        if (slab.getCarModel() == null || slab.getCarModel().getId() == null) {
            throw new IllegalArgumentException("Car model is required for each incentive slab");
        }
        CarModel carModel = carModelRepository.findById(slab.getCarModel().getId())
                .orElseThrow(() -> new IllegalArgumentException("Car model not found"));
        slab.setCarModel(carModel);

        if (slab.getMaxCars() != null && slab.getMinCars() >= slab.getMaxCars()) {
            throw new IllegalArgumentException("minCars must be less than maxCars");
        }
        if (slab.getAmountPerCar().signum() <= 0) {
            throw new IllegalArgumentException("amountPerCar must be positive");
        }

        List<IncentiveSlab> existing = incentiveSlabRepository.findByCarModelIdOrderByMinCarsAsc(carModel.getId());
        for (IncentiveSlab e : existing) {
            if (slab.getId() != null && slab.getId().equals(e.getId())) {
                continue;
            }
            if (overlap(slab, e)) {
                throw new IllegalArgumentException(
                        "Slab range overlaps with existing slab for this model (ID " + e.getId() + ")");
            }
        }

        return incentiveSlabRepository.save(slab);
    }

    private boolean overlap(IncentiveSlab a, IncentiveSlab b) {
        int aMax = a.getMaxCars() == null ? Integer.MAX_VALUE : a.getMaxCars();
        int bMax = b.getMaxCars() == null ? Integer.MAX_VALUE : b.getMaxCars();
        return Math.max(a.getMinCars(), b.getMinCars()) <= Math.min(aMax, bMax);
    }

    @Transactional
    public void deleteSlab(Long id) {
        incentiveSlabRepository.deleteById(id);
    }
}
