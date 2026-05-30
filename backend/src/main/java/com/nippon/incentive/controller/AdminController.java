package com.nippon.incentive.controller;

import com.nippon.incentive.entity.CarModel;
import com.nippon.incentive.entity.IncentiveSlab;
import com.nippon.incentive.service.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/cars")
    public List<CarModel> getAllCars() {
        return adminService.getAllCars();
    }

    @PostMapping("/cars")
    public CarModel createCar(@RequestBody CarModel carModel) {
        return adminService.saveCar(carModel);
    }

    @PutMapping("/cars/{id}")
    public CarModel updateCar(@PathVariable Long id, @RequestBody CarModel carModel) {
        carModel.setId(id);
        return adminService.saveCar(carModel);
    }

    @DeleteMapping("/cars/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable Long id) {
        try {
            adminService.deleteCar(id);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/slabs")
    public List<IncentiveSlab> getAllSlabs(@RequestParam(required = false) Long carModelId) {
        if (carModelId != null) {
            return adminService.getSlabsByCarModel(carModelId);
        }
        return adminService.getAllSlabs();
    }

    @PostMapping("/slabs")
    public IncentiveSlab createSlab(@RequestBody IncentiveSlab slab) {
        return adminService.saveSlab(slab);
    }

    @PutMapping("/slabs/{id}")
    public IncentiveSlab updateSlab(@PathVariable Long id, @RequestBody IncentiveSlab slab) {
        slab.setId(id);
        return adminService.saveSlab(slab);
    }

    @DeleteMapping("/slabs/{id}")
    public ResponseEntity<?> deleteSlab(@PathVariable Long id) {
        adminService.deleteSlab(id);
        return ResponseEntity.ok().build();
    }
}
