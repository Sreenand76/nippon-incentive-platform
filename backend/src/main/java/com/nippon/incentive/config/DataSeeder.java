package com.nippon.incentive.config;

import com.nippon.incentive.entity.Role;
import com.nippon.incentive.entity.User;
import com.nippon.incentive.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        if (userRepository.findByEmail("sales@example.com").isEmpty()) {
            User sales = new User();
            sales.setEmail("sales@example.com");
            sales.setPassword(passwordEncoder.encode("sales123"));
            sales.setRole(Role.SALES_OFFICER);
            userRepository.save(sales);
        }
    }
}
