package com.sunrise.dental.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HelpController {

    @GetMapping("/help")
    public ResponseEntity<Map<String, Object>> getHelp() {
        Map<String, Object> help = Map.of(
                "title", "Sunrise Dental Clinic Help",
                "steps", List.of(
                        "1. Login with your clinic username and password.",
                        "2. Register a patient appointment with the required details.",
                        "3. Search for an appointment using the appointment number.",
                        "4. View complete patient and appointment details.",
                        "5. Confirm the treatment type to calculate the cost.",
                        "6. Generate the bill or receipt for the patient.",
                        "7. Use the safe exit option to close the system securely."
                )
        );

        return ResponseEntity.ok(help);
    }
}
