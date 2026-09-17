package com.greencircuit.backend.modules.pickup.entity;

public enum RequestStatus {
    PENDING,
    ACCEPTED,
    ASSIGNED,
    PICKUP_SCHEDULED,
    ON_THE_WAY,
    COLLECTED,
    RECEIVED_AT_OFFICE,
    RECYCLED,
    COMPLETED,
    REJECTED,
    CANCELLED
}
