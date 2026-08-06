package com.greencircuit.backend.config;

import com.greencircuit.backend.entity.RewardItem;
import com.greencircuit.backend.repository.RewardItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner initDatabase(RewardItemRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new RewardItem("$10 Amazon Gift Card", "Digital gift card for Amazon.com", 100, "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?q=80&w=250&auto=format&fit=crop"));
                repository.save(new RewardItem("Eco-Friendly Tote Bag", "Reusable organic cotton tote bag", 50, "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?q=80&w=250&auto=format&fit=crop"));
                repository.save(new RewardItem("Stainless Steel Water Bottle", "Keep drinks cold for 24 hours", 75, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=250&auto=format&fit=crop"));
                repository.save(new RewardItem("Bamboo Utensil Set", "Zero waste cutlery for on the go", 30, "https://images.unsplash.com/photo-1584346083584-180126a10de5?q=80&w=250&auto=format&fit=crop"));
            }
        };
    }
}
