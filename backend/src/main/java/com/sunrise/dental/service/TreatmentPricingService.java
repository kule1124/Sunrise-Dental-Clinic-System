package com.sunrise.dental.service;

import java.math.BigDecimal;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class TreatmentPricingService {

    private static final Map<String, BigDecimal> TREATMENT_FEES = Map.of(
            "Dental Cleaning", new BigDecimal("2500.00"),
            "Tooth Extraction", new BigDecimal("4500.00"),
            "Dental Filling", new BigDecimal("6000.00"),
            "Root Canal", new BigDecimal("12000.00"),
            "Dental Checkup", new BigDecimal("1800.00")
    );

    public BigDecimal calculateCost(String treatmentType) {
        if (treatmentType == null || treatmentType.isBlank()) {
            throw new IllegalArgumentException("Treatment type is required");
        }

        BigDecimal fee = TREATMENT_FEES.get(treatmentType.trim());
        if (fee == null) {
            throw new IllegalArgumentException("Unsupported treatment type: " + treatmentType.trim());
        }

        return fee;
    }
}
