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
                        null,
                        null, // latitude to be updated later
                        null, // longitude to be updated later
                        "+91 9840235929",
                        null,
                        null,
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
                        null, // latitude
                        null, // longitude
                        "+91 9361328436",
                        null,
                        null,
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
                        null,
                        null, // latitude
                        null, // longitude
                        "+91 9786731317",
                        null,
                        null,
                        true,
                        "ACTIVE",
                        "9:00 AM - 6:00 PM"
                );

                officeRepository.saveAll(List.of(center1, center2, center3));
                System.out.println("Seeded initial E-Waste Collection Centers.");
            }
        };
    }
}
