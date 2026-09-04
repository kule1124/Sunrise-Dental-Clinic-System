package com.sunrise.dental.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class TreatmentPricingServiceTest {

    private final TreatmentPricingService pricingService = new TreatmentPricingService();

    @Test
    void shouldCalculateCostForKnownTreatmentType() {
        BigDecimal cost = pricingService.calculateCost("Dental Cleaning");

        assertEquals(new BigDecimal("2500.00"), cost);
    }

    @Test
    void shouldThrowExceptionForUnknownTreatmentType() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> pricingService.calculateCost("Unknown Treatment")
        );

        assertEquals("Unsupported treatment type: Unknown Treatment", exception.getMessage());
    }
}
