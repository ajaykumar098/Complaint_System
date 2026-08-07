package com.complaintsystem.controller;

import com.complaintsystem.dto.CreateComplaintRequest;
import com.complaintsystem.dto.UpdateComplaintRequest;
import com.complaintsystem.entity.Complaint;
import com.complaintsystem.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    @Autowired
    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<?> createComplaint(
            @RequestParam("description") String description,
            @RequestParam("priority") String priority,
            @RequestParam("userId") String userId,
            @RequestParam("userName") String userName,
            @RequestParam(value = "userMobile", required = false) String userMobile,
            @RequestParam(value = "locationAddress", required = false) String locationAddress,
            @RequestParam(value = "locationLat", required = false) Double locationLat,
            @RequestParam(value = "locationLng", required = false) Double locationLng,
            @RequestParam(value = "evidenceFiles", required = false) List<MultipartFile> evidenceFiles) {
        
        try {
            CreateComplaintRequest request = new CreateComplaintRequest();
            request.setDescription(description);
            request.setPriority(priority);
            request.setUserId(userId);
            request.setUserName(userName);
            request.setUserMobile(userMobile);
            request.setLocationAddress(locationAddress);
            request.setLocationLat(locationLat);
            request.setLocationLng(locationLng);
            request.setEvidenceFiles(evidenceFiles);

            Complaint complaint = complaintService.createComplaint(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(complaint);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload files to Cloudinary: " + e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create complaint: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Complaint>> getComplaintsByUserId(@PathVariable String userId) {
        List<Complaint> complaints = complaintService.getComplaintsByUserId(userId);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id) {
        Complaint complaint = complaintService.getComplaintById(id);
        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/by-complaint-id/{complaintId}")
    public ResponseEntity<Complaint> getComplaintByComplaintId(@PathVariable String complaintId) {
        Complaint complaint = complaintService.getComplaintByComplaintId(complaintId);
        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(complaint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComplaint(@PathVariable Long id, @Valid @RequestBody UpdateComplaintRequest request) {
        try {
            Complaint complaint = complaintService.updateComplaint(id, request);
            if (complaint == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(complaint);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelComplaint(@PathVariable Long id) {
        try {
            Complaint complaint = complaintService.cancelComplaint(id);
            if (complaint == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(complaint);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "sortBy", required = false) String sortBy) {
        
        Complaint.Status statusEnum = null;
        if (status != null && !status.isEmpty()) {
            try {
                statusEnum = Complaint.Status.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        Complaint.Priority priorityEnum = null;
        if (priority != null && !priority.isEmpty()) {
            try {
                priorityEnum = Complaint.Priority.valueOf(priority.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        List<Complaint> complaints = complaintService.getAllComplaints(statusEnum, priorityEnum, sortBy);
        return ResponseEntity.ok(complaints);
    }
}
