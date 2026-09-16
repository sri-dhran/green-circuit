package com.greencircuit.backend.modules.pickup.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Custom JPA converter for RequestStatus that handles legacy status values
 * stored in the database (e.g., "COMPLETED") that no longer exist in the enum.
 */
@Converter(autoApply = false)
public class RequestStatusConverter implements AttributeConverter<RequestStatus, String> {

    @Override
    public String convertToDatabaseColumn(RequestStatus status) {
        if (status == null) {
            return null;
        }
        return status.name();
    }

    @Override
    public RequestStatus convertToEntityAttribute(String dbValue) {
        if (dbValue == null || dbValue.isBlank()) {
            return RequestStatus.PENDING;
        }
        String clean = dbValue.trim().toUpperCase();
        return switch (clean) {
            case "COMPLETED" -> RequestStatus.COMPLETED;
            case "RECEIVED" -> RequestStatus.RECEIVED_AT_OFFICE;
            default -> {
                try {
                    yield RequestStatus.valueOf(clean);
                } catch (IllegalArgumentException e) {
                    yield RequestStatus.PENDING;
                }
            }
        };
    }
}
