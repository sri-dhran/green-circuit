package com.greencircuit.backend.modules.pickup.entity;

public enum RequestStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    PICKUP_SCHEDULED,
    COLLECTED,
    RECEIVED_AT_OFFICE,
    RECYCLED,
    COMPLETED,
    CANCELLED
}
