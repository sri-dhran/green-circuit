package com.greencircuit.backend.modules.center.controller;

import com.greencircuit.backend.modules.center.dto.OfficeDTO;
import com.greencircuit.backend.modules.center.service.OfficeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offices")
public class OfficeController {

    private final OfficeService officeService;

    public OfficeController(OfficeService officeService) {
        this.officeService = officeService;
    }

    @PostMapping
    @PreAuthorize("hasRole('OFFICE') or hasRole('USER')")
    public ResponseEntity<OfficeDTO> createOffice(@Valid @RequestBody OfficeDTO officeDTO) {
        return ResponseEntity.ok(officeService.createOffice(officeDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OFFICE') or hasRole('USER')")
    public ResponseEntity<OfficeDTO> updateOffice(@PathVariable Long id, @Valid @RequestBody OfficeDTO officeDTO) {
        return ResponseEntity.ok(officeService.updateOffice(id, officeDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OFFICE') or hasRole('USER')")
    public ResponseEntity<Void> deleteOffice(@PathVariable Long id) {
        officeService.deleteOffice(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<OfficeDTO>> getAllOffices() {
        return ResponseEntity.ok(officeService.getAllOffices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficeDTO> getOfficeById(@PathVariable Long id) {
        return ResponseEntity.ok(officeService.getOfficeById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<OfficeDTO>> searchOffices(@RequestParam String query) {
        return ResponseEntity.ok(officeService.searchOffices(query));
    }
}
