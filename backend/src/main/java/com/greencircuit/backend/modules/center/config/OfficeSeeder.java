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
            List<Office> predefinedOffices = List.of(
                    // 1. Techazar (Malumichampatti)
                    new Office(
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
                    ),
                    // 2. Green Era Recyclers (Seerapalayam)
                    new Office(
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
                    ),
                    // 3. Adhira Recyclening (Avvai Nagar, Malumichampatti)
                    new Office(
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
                    ),
                    // 4. [NEW 1] Green India Recyclers (Kinathukadavu / Pollachi Road)
                    new Office(
                            "Green India Recyclers",
                            "Authorized E-Waste Recycler",
                            "S.F. No. 26/1B, Kovilpalayam Road, Sulakkal Village, Kinathukadavu Taluk, Coimbatore, Tamil Nadu 642110",
                            "Kinathukadavu",
                            "Coimbatore",
                            "Tamil Nadu",
                            "642110",
                            10.8194,
                            76.9922,
                            "+91 90034 91034",
                            "info@greenindiarecyclers.com",
                            "CPCB & TNPCB certified safe electronic dismantling and bulk recycling",
                            true,
                            "ACTIVE",
                            "9:00 AM - 6:30 PM"
                    ),
                    // 5. [NEW 2] Dharani Recyclers (Rathinapuri)
                    new Office(
                            "Dharani Recyclers",
                            "Authorized E-Waste Processing Center",
                            "No. 1-B, P.M. Swamy Colony, Lala Mahal Road, Rathinapuri, Coimbatore, Tamil Nadu 641027",
                            "Rathinapuri",
                            "Coimbatore",
                            "Tamil Nadu",
                            "641027",
                            11.0268,
                            76.9625,
                            "+91 98422 13540",
                            "dharanirecyclers@gmail.com",
                            "Authorized consumer IT equipment collection, safe disposal, and recycling",
                            true,
                            "ACTIVE",
                            "9:30 AM - 6:00 PM"
                    ),
                    // 6. [NEW 3] Eco Birbals E-Waste Collection Hub (SIDCO Kurichi / Eachanari)
                    new Office(
                            "Eco Birbals E-Waste Collection Hub",
                            "Authorized Collection Point",
                            "Plot No. 42, SIDCO Industrial Estate, Kurichi, Coimbatore, Tamil Nadu 641021",
                            "Kurichi SIDCO",
                            "Coimbatore",
                            "Tamil Nadu",
                            "641021",
                            10.9360,
                            76.9680,
                            "+91 94432 55670",
                            "contact@ecobirbals.in",
                            "Industrial and consumer electronic scrap drop-off and certified handling",
                            true,
                            "ACTIVE",
                            "8:30 AM - 6:00 PM"
                    )
            );

            for (Office office : predefinedOffices) {
                boolean exists = officeRepository.findAll().stream()
                        .anyMatch(o -> o.getOfficeName() != null && o.getOfficeName().trim().equalsIgnoreCase(office.getOfficeName().trim()));
                if (!exists) {
                    officeRepository.save(office);
                    System.out.println("Seeded authorized e-waste office: " + office.getOfficeName());
                }
            }
        };
    }
}

