package com.complaintsystem.controller;

import com.complaintsystem.dto.AdminResponseRequest;
import com.complaintsystem.dto.DashboardStats;
import com.complaintsystem.dto.StatusUpdateRequest;
import com.complaintsystem.entity.Complaint;
import com.complaintsystem.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        try {
            Complaint complaint = adminService.updateComplaintStatus(id, request);
            if (complaint == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(complaint);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value");
        }
    }

    @PostMapping("/complaints/{id}/response")
    public ResponseEntity<?> addAdminResponse(@PathVariable Long id, @Valid @RequestBody AdminResponseRequest request) {
        Complaint complaint = adminService.addAdminResponse(id, request);
        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
