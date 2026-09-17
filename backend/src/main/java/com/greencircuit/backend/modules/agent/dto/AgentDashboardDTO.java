package com.greencircuit.backend.modules.agent.dto;

public class AgentDashboardDTO {

    private long assignedRequests;
    private long pendingPickups;
    private long todayPickups;
    private long completedPickups;

    public AgentDashboardDTO() {
    }

    public AgentDashboardDTO(long assignedRequests, long pendingPickups, long todayPickups, long completedPickups) {
        this.assignedRequests = assignedRequests;
        this.pendingPickups = pendingPickups;
        this.todayPickups = todayPickups;
        this.completedPickups = completedPickups;
    }

    public long getAssignedRequests() {
        return assignedRequests;
    }

    public void setAssignedRequests(long assignedRequests) {
        this.assignedRequests = assignedRequests;
    }

    public long getPendingPickups() {
        return pendingPickups;
    }

    public void setPendingPickups(long pendingPickups) {
        this.pendingPickups = pendingPickups;
    }

    public long getTodayPickups() {
        return todayPickups;
    }

    public void setTodayPickups(long todayPickups) {
        this.todayPickups = todayPickups;
    }

    public long getCompletedPickups() {
        return completedPickups;
    }

    public void setCompletedPickups(long completedPickups) {
        this.completedPickups = completedPickups;
    }
}
