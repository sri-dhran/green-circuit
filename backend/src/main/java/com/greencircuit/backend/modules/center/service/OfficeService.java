package com.greencircuit.backend.modules.center.service;

import com.greencircuit.backend.modules.center.dto.OfficeDTO;
import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.center.repository.OfficeRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
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
        existingOffice.setType(officeDTO.getType());
        existingOffice.setAddress(officeDTO.getAddress());
        existingOffice.setArea(officeDTO.getArea());
        existingOffice.setCity(officeDTO.getCity());
        existingOffice.setState(officeDTO.getState());
        existingOffice.setPincode(officeDTO.getPincode());
        existingOffice.setLatitude(officeDTO.getLatitude());
        existingOffice.setLongitude(officeDTO.getLongitude());
        existingOffice.setPhoneNumber(officeDTO.getPhoneNumber());
        existingOffice.setEmail(officeDTO.getEmail());
        existingOffice.setServices(officeDTO.getServices());
        existingOffice.setAcceptsIndividualUsers(officeDTO.getAcceptsIndividualUsers());
        existingOffice.setStatus(officeDTO.getStatus());
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

    public List<OfficeDTO> findNearbyCenters(Double latitude, Double longitude, Double radiusKm) {
        List<Office> activeOffices = officeRepository.findByStatus("ACTIVE");
        
        return activeOffices.stream()
                .filter(office -> office.getLatitude() != null && office.getLongitude() != null)
                .map(office -> {
                    Double distance = calculateHaversineDistance(latitude, longitude, office.getLatitude(), office.getLongitude());
                    OfficeDTO dto = mapToDTO(office);
                    dto.setDistanceKm(Math.round(distance * 100.0) / 100.0);
                    return dto;
                })
                .filter(dto -> dto.getDistanceKm() <= radiusKm)
                .sorted(Comparator.comparingDouble(OfficeDTO::getDistanceKm))
                .collect(Collectors.toList());
    }

    private Double calculateHaversineDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
                 
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private Office mapToEntity(OfficeDTO dto) {
        Office entity = new Office();
        entity.setId(dto.getId());
        entity.setOfficeName(dto.getOfficeName());
        entity.setType(dto.getType());
        entity.setAddress(dto.getAddress());
        entity.setArea(dto.getArea());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setPincode(dto.getPincode());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        entity.setServices(dto.getServices());
        if (dto.getAcceptsIndividualUsers() != null) {
            entity.setAcceptsIndividualUsers(dto.getAcceptsIndividualUsers());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        entity.setWorkingHours(dto.getWorkingHours());
        return entity;
    }

    private OfficeDTO mapToDTO(Office entity) {
        OfficeDTO dto = new OfficeDTO();
        dto.setId(entity.getId());
        dto.setOfficeName(entity.getOfficeName());
        dto.setType(entity.getType());
        dto.setAddress(entity.getAddress());
        dto.setArea(entity.getArea());
        dto.setCity(entity.getCity());
        dto.setState(entity.getState());
        dto.setPincode(entity.getPincode());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setEmail(entity.getEmail());
        dto.setServices(entity.getServices());
        dto.setAcceptsIndividualUsers(entity.getAcceptsIndividualUsers());
        dto.setStatus(entity.getStatus());
        dto.setWorkingHours(entity.getWorkingHours());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
