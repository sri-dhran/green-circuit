package com.greencircuit.backend.modules.analytics.controller;

import com.greencircuit.backend.modules.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping({"/api/analytics", "/api/admin/analytics"})
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') and authentication.name == 'sri741815@gmail.com'")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(value = "period", required = false, defaultValue = "all") String period
    ) {
        return ResponseEntity.ok(analyticsService.getDashboardStats(period));
    }
}
