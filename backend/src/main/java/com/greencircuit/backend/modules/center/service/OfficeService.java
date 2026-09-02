package com.greencircuit.backend.modules.center.service;

import com.greencircuit.backend.modules.center.dto.OfficeDTO;
import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.center.repository.OfficeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OfficeService {

    private final OfficeRepository officeRepository;

    public OfficeService(OfficeRepository officeRepository) {
        this.officeRepository = officeRepository;
    }

    public OfficeDTO createOffice(OfficeDTO officeDTO) {
        Office office = mapToEntity(officeDTO);
        Office savedOffice = officeRepository.save(office);
        return mapToDTO(savedOffice);
    }

    public OfficeDTO updateOffice(Long id, OfficeDTO officeDTO) {
        Office existingOffice = officeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Office not found with id: " + id));

        existingOffice.setOfficeName(officeDTO.getOfficeName());
        existingOffice.setAddress(officeDTO.getAddress());
        existingOffice.setLatitude(officeDTO.getLatitude());
        existingOffice.setLongitude(officeDTO.getLongitude());
        existingOffice.setPhoneNumber(officeDTO.getPhoneNumber());
        existingOffice.setWorkingHours(officeDTO.getWorkingHours());

        Office updatedOffice = officeRepository.save(existingOffice);
        return mapToDTO(updatedOffice);
    }

    public void deleteOffice(Long id) {
        Office existingOffice = officeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Office not found with id: " + id));
        officeRepository.delete(existingOffice);
    }

    public List<OfficeDTO> getAllOffices() {
        return officeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public OfficeDTO getOfficeById(Long id) {
        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Office not found with id: " + id));
        return mapToDTO(office);
    }

    public List<OfficeDTO> searchOffices(String query) {
        return officeRepository.findByOfficeNameContainingIgnoreCase(query).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private Office mapToEntity(OfficeDTO dto) {
        return new Office(
                dto.getOfficeName(),
                dto.getAddress(),
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getPhoneNumber(),
                dto.getWorkingHours()
        );
    }

    private OfficeDTO mapToDTO(Office entity) {
        return new OfficeDTO(
                entity.getId(),
                entity.getOfficeName(),
                entity.getAddress(),
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getPhoneNumber(),
                entity.getWorkingHours()
        );
    }
}
