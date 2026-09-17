package com.greencircuit.backend.modules.agent.controller;

import com.greencircuit.backend.modules.agent.dto.AgentDashboardDTO;
import com.greencircuit.backend.modules.agent.dto.AgentResponseDTO;
import com.greencircuit.backend.modules.agent.dto.CreateAgentDTO;
import com.greencircuit.backend.modules.agent.dto.UpdateAgentDTO;
import com.greencircuit.backend.modules.agent.service.CollectionAgentService;
import com.greencircuit.backend.modules.pickup.entity.PickupRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CollectionAgentController {

    private final CollectionAgentService agentService;

    public CollectionAgentController(CollectionAgentService agentService) {
        this.agentService = agentService;
    }

    // ── Office Management Endpoints ──────────────────────────────────────────

    @PreAuthorize("hasAnyRole('OFFICE', 'SUPER_ADMIN')")
    @PostMapping("/agents")
    public ResponseEntity<AgentResponseDTO> createAgent(
            @Valid @RequestBody CreateAgentDTO dto,
            Authentication authentication
    ) {
        AgentResponseDTO agent = agentService.createAgent(authentication.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(agent);
    }

    @PreAuthorize("hasAnyRole('OFFICE', 'SUPER_ADMIN')")
    @GetMapping("/agents")
    public ResponseEntity<List<AgentResponseDTO>> getOfficeAgents(Authentication authentication) {
        return ResponseEntity.ok(agentService.getAgentsForOffice(authentication.getName()));
    }

    @PreAuthorize("hasAnyRole('OFFICE', 'SUPER_ADMIN')")
    @GetMapping("/agents/{id}")
    public ResponseEntity<AgentResponseDTO> getAgentById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(agentService.getAgentById(id, authentication.getName()));
    }

    @PreAuthorize("hasAnyRole('OFFICE', 'SUPER_ADMIN')")
    @PutMapping("/agents/{id}")
    public ResponseEntity<AgentResponseDTO> updateAgent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAgentDTO dto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(agentService.updateAgent(id, dto, authentication.getName()));
    }

    @PreAuthorize("hasAnyRole('OFFICE', 'SUPER_ADMIN')")
    @PatchMapping("/agents/{id}/status")
    public ResponseEntity<AgentResponseDTO> toggleAgentStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            Authentication authentication
    ) {
        return ResponseEntity.ok(agentService.toggleStatus(id, status, authentication.getName()));
    }

    // ── Collection Agent Portal Endpoints ─────────────────────────────────────

    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    @GetMapping("/agent/profile")
    public ResponseEntity<AgentResponseDTO> getAgentProfile(Authentication authentication) {
        return ResponseEntity.ok(agentService.toDTO(agentService.getAgentForUser(authentication.getName())));
    }

    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    @GetMapping("/agent/dashboard")
    public ResponseEntity<AgentDashboardDTO> getAgentDashboard(Authentication authentication) {
        return ResponseEntity.ok(agentService.getAgentDashboardStats(authentication.getName()));
    }

    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    @GetMapping("/agent/requests")
    public ResponseEntity<List<PickupRequest>> getAgentAssignedRequests(
            @RequestParam(value = "status", required = false) String status,
            Authentication authentication
    ) {
        return ResponseEntity.ok(agentService.getAgentAssignedRequests(authentication.getName(), status));
    }

    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    @GetMapping("/agent/requests/{id}")
    public ResponseEntity<PickupRequest> getAgentRequestById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(agentService.getAgentRequestById(id, authentication.getName()));
    }

    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    @PutMapping("/agent/requests/{id}/status")
    public ResponseEntity<PickupRequest> updateAgentRequestStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "proofUrl", required = false) String proofUrl,
            Authentication authentication
    ) {
        return ResponseEntity.ok(agentService.updateAgentRequestStatus(id, status, remarks, proofUrl, authentication.getName()));
    }
}
