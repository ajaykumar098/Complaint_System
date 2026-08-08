package com.complaintsystem.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.complaintsystem.dto.CreateComplaintRequest;
import com.complaintsystem.dto.UpdateComplaintRequest;
import com.complaintsystem.entity.*;
import com.complaintsystem.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final Cloudinary cloudinary;
    private final NotificationService notificationService;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository, Cloudinary cloudinary, NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.cloudinary = cloudinary;
        this.notificationService = notificationService;
    }

    @Transactional
    public Complaint createComplaint(CreateComplaintRequest request) throws IOException {
        // Generate unique complaint ID: CMP-YYYY-#####
        String complaintId = generateComplaintId();

        // Upload evidence files to Cloudinary first
        List<ComplaintEvidence> evidenceList = new ArrayList<>();
        if (request.getEvidenceFiles() != null && !request.getEvidenceFiles().isEmpty()) {
            for (MultipartFile file : request.getEvidenceFiles()) {
                String cloudinaryUrl = uploadToCloudinary(file, complaintId);
                ComplaintEvidence evidence = createEvidence(file, cloudinaryUrl, request);
                evidenceList.add(evidence);
            }
        }

        // Create complaint
        Complaint complaint = new Complaint();
        complaint.setComplaintId(complaintId);
        complaint.setDescription(request.getDescription());
        complaint.setPriority(Complaint.Priority.valueOf(request.getPriority().toUpperCase()));
        complaint.setStatus(Complaint.Status.SENT);
        complaint.setUserId(request.getUserId());
        complaint.setUserName(request.getUserName());
        complaint.setUserMobile(request.getUserMobile());
        complaint.setUserEmail(request.getUserEmail());
        complaint.setLocationAddress(request.getLocationAddress());
        complaint.setLocationLat(request.getLocationLat());
        complaint.setLocationLng(request.getLocationLng());

        // Save complaint first to get its ID
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Set complaint reference on each evidence and save
        for (ComplaintEvidence evidence : evidenceList) {
            evidence.setComplaint(savedComplaint);
        }
        savedComplaint.setEvidence(evidenceList);

        // Save again to persist evidence
        savedComplaint = complaintRepository.save(savedComplaint);

        // Create notification for submission
        notificationService.createNotification(savedComplaint, Notification.NotificationType.SUBMITTED, "Complaint submitted successfully");

        return savedComplaint;
    }

    public List<Complaint> getComplaintsByUserId(String userId) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id).orElse(null);
    }

    public Complaint getComplaintByComplaintId(String complaintId) {
        return complaintRepository.findByComplaintId(complaintId).orElse(null);
    }

    @Transactional
    public Complaint updateComplaint(Long id, UpdateComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return null;
        }

        // Only allow edit if status is SENT
        if (complaint.getStatus() != Complaint.Status.SENT) {
            throw new IllegalStateException("Complaint can only be edited when status is SENT");
        }

        complaint.setDescription(request.getDescription());
        complaint.setPriority(Complaint.Priority.valueOf(request.getPriority().toUpperCase()));

        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint cancelComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return null;
        }

        // Only allow cancel if status is SENT
        if (complaint.getStatus() != Complaint.Status.SENT) {
            throw new IllegalStateException("Complaint can only be cancelled when status is SENT");
        }

        complaint.setStatus(Complaint.Status.CANCELLED);
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Create notification for cancellation
        notificationService.createNotification(savedComplaint, Notification.NotificationType.REJECTED, "Complaint cancelled");

        return savedComplaint;
    }

    public List<Complaint> getAllComplaints(Complaint.Status status, Complaint.Priority priority, String sortBy) {
        List<Complaint> complaints;

        if (status != null && priority != null) {
            complaints = complaintRepository.findByStatusAndPriority(status, priority);
        } else if (status != null) {
            complaints = complaintRepository.findByStatus(status);
        } else if (priority != null) {
            complaints = complaintRepository.findByPriority(priority);
        } else {
            complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        }

        // Apply sorting if specified
        if ("priority".equals(sortBy)) {
            complaints.sort((c1, c2) -> c2.getPriority().compareTo(c1.getPriority()));
        }

        return complaints;
    }

    private String generateComplaintId() {
        String year = String.valueOf(Year.now().getValue());
        String prefix = "CMP-" + year + "-";
        
        // Find the highest sequence number for this year
        List<Complaint> existingComplaints = complaintRepository.findByComplaintIdStartingWith(prefix);
        int maxSequence = 0;
        for (Complaint c : existingComplaints) {
            String id = c.getComplaintId();
            if (id.startsWith(prefix)) {
                try {
                    int sequence = Integer.parseInt(id.substring(prefix.length()));
                    if (sequence > maxSequence) {
                        maxSequence = sequence;
                    }
                } catch (NumberFormatException e) {
                    // Ignore invalid IDs
                }
            }
        }

        int newSequence = maxSequence + 1;
        return prefix + String.format("%05d", newSequence);
    }

    private String uploadToCloudinary(MultipartFile file, String complaintId) throws IOException {
        String folderPath = "complaints/" + complaintId + "/";

        Map<String, Object> uploadParams = ObjectUtils.asMap(
            "folder", folderPath,
            "resource_type", "auto"
        );

        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        return (String) uploadResult.get("secure_url");
    }

    private ComplaintEvidence createEvidence(MultipartFile file, String cloudinaryUrl, CreateComplaintRequest request) {
        ComplaintEvidence evidence = new ComplaintEvidence();
        evidence.setFileName(file.getOriginalFilename());
        evidence.setFilePath(cloudinaryUrl);
        
        // Determine file type
        String contentType = file.getContentType();
        if (contentType != null && contentType.startsWith("image/")) {
            evidence.setType(ComplaintEvidence.EvidenceType.IMAGE);
        } else if (contentType != null && contentType.startsWith("video/")) {
            evidence.setType(ComplaintEvidence.EvidenceType.VIDEO);
        } else {
            evidence.setType(ComplaintEvidence.EvidenceType.IMAGE); // Default
        }

        // Determine location type based on whether location is provided
        if (request.getLocationLat() != null && request.getLocationLng() != null) {
            evidence.setLocationType(ComplaintEvidence.LocationType.EMBEDDED);
            evidence.setLocationAddress(request.getLocationAddress());
            evidence.setLocationLat(request.getLocationLat());
            evidence.setLocationLng(request.getLocationLng());
        } else {
            evidence.setLocationType(ComplaintEvidence.LocationType.NONE);
        }

        return evidence;
    }
}
