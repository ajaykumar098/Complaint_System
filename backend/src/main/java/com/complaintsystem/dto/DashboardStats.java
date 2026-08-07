package com.complaintsystem.dto;

import java.util.Map;

public class DashboardStats {

    private long totalComplaints;
    private Map<String, Long> statusCounts;
    private Map<String, Long> priorityCounts;

    public DashboardStats() {}

    public DashboardStats(long totalComplaints, Map<String, Long> statusCounts, Map<String, Long> priorityCounts) {
        this.totalComplaints = totalComplaints;
        this.statusCounts = statusCounts;
        this.priorityCounts = priorityCounts;
    }

    public long getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(long totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public Map<String, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public Map<String, Long> getPriorityCounts() {
        return priorityCounts;
    }

    public void setPriorityCounts(Map<String, Long> priorityCounts) {
        this.priorityCounts = priorityCounts;
    }
}
