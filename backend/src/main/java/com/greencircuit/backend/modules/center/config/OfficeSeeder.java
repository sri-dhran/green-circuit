package com.greencircuit.backend.modules.center.config;

import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.center.repository.OfficeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OfficeSeeder {

    @Bean
    public CommandLineRunner seedOffices(OfficeRepository officeRepository) {
        return args -> {
            if (officeRepository.count() == 0) {
                Office center1 = new Office(
                        "Techazar E-Cyclers Private Limited",
                        "E-Waste Recycler",
                        "No. 15, Mother India Industrial Estate, Seerapalayam Link Road, Malumichampatti, Coimbatore, Tamil Nadu",
                        "Malumichampatti",
                        "Coimbatore",
                        "Tamil Nadu",
                        "641050",
                        10.9018,
                        76.9962,
                        "+91 9840235929",
                        "contact@techazar.com",
                        "Electronic waste collection, segregation and certified recycling",
                        true,
                        "ACTIVE",
                        "9:00 AM - 6:00 PM"
                );

                Office center2 = new Office(
                        "Green Era Recyclers",
                        "E-Waste Recycler",
                        "SF No. 91/1B, Sai Keerthi Industrial Estate, Seerapalayam, Coimbatore, Tamil Nadu 641032",
                        "Seerapalayam",
                        "Coimbatore",
                        "Tamil Nadu",
                        "641032",
                        10.8872,
                        76.9915,
                        "+91 9361328436",
                        "info@greenerarecyclers.com",
                        "Industrial and consumer e-waste recycling and disposal",
                        true,
                        "ACTIVE",
                        "9:00 AM - 6:00 PM"
                );

                Office center3 = new Office(
                        "Adhira Recyclening",
                        "Waste Management / Recycling Center",
                        "573, Avvai Nagar, Malumichampatti, Pothanur to Chettipalayam Road, Coimbatore, Tamil Nadu",
                        "Malumichampatti",
                        "Coimbatore",
                        "Tamil Nadu",
                        "641050",
                        10.9085,
                        76.9940,
                        "+91 9786731317",
                        "support@adhirarecycling.com",
                        "Comprehensive waste management and e-waste refurbishment",
                        true,
                        "ACTIVE",
                        "9:00 AM - 6:00 PM"
                );

                officeRepository.saveAll(List.of(center1, center2, center3));
                System.out.println("Seeded initial E-Waste Collection Centers with valid coordinates.");
            } else {
                List<Office> existingOffices = officeRepository.findAll();
                for (Office o : existingOffices) {
                    if (o.getLatitude() == null || o.getLongitude() == null) {
                        if (o.getOfficeName() != null && o.getOfficeName().contains("Techazar")) {
                            o.setLatitude(10.9018);
                            o.setLongitude(76.9962);
                        } else if (o.getOfficeName() != null && o.getOfficeName().contains("Green Era")) {
                            o.setLatitude(10.8872);
                            o.setLongitude(76.9915);
                        } else if (o.getOfficeName() != null && o.getOfficeName().contains("Adhira")) {
                            o.setLatitude(10.9085);
                            o.setLongitude(76.9940);
                        } else {
                            o.setLatitude(10.9018);
                            o.setLongitude(76.9962);
                        }
                        officeRepository.save(o);
                    }
                }
            }
        };
    }
}
