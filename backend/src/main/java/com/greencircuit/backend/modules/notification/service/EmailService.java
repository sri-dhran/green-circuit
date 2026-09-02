package com.greencircuit.backend.modules.notification.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("noreply@greencircuit.com");
                mailSender.send(message);
                System.out.println("Email sent to: " + to);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        } else {
            System.out.println("Email Simulation -> To: " + to + " Subject: " + subject + " Body: " + body);
        }
    }
}
