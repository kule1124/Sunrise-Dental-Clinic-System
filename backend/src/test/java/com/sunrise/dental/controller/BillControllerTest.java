package com.sunrise.dental.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sunrise.dental.model.Appointment;
import com.sunrise.dental.service.AppointmentService;
import com.sunrise.dental.service.BillingService;
import com.sunrise.dental.service.TreatmentPricingService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class BillControllerTest {

    @Test
    void shouldGenerateBillForExistingAppointment() throws Exception {
        AppointmentService appointmentService = org.mockito.Mockito.mock(AppointmentService.class);
        TreatmentPricingService treatmentPricingService = new TreatmentPricingService();
        BillingService billingService = new BillingService();

        Appointment appointment = new Appointment(
                "APT-1001",
                "Nimal Perera",
                "Colombo 07",
                "0771234567",
                "Dr. Silva",
                "Dental Cleaning",
                LocalDate.of(2026, 9, 10),
                LocalTime.of(10, 30)
        );

        when(appointmentService.findByAppointmentNumber("APT-1001")).thenReturn(Optional.of(appointment));

        BillController controller = new BillController(appointmentService, treatmentPricingService, billingService);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/api/bills/APT-1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointmentNumber").value("APT-1001"))
                .andExpect(jsonPath("$.patientName").value("Nimal Perera"))
                .andExpect(jsonPath("$.dentistName").value("Dr. Silva"))
                .andExpect(jsonPath("$.treatmentType").value("Dental Cleaning"))
                .andExpect(jsonPath("$.consultationFee").value(500.00))
                .andExpect(jsonPath("$.treatmentCost").value(2500.00))
                .andExpect(jsonPath("$.totalAmount").value(3000.00));
    }

    @Test
    void shouldReturnNotFoundForMissingAppointment() throws Exception {
        AppointmentService appointmentService = org.mockito.Mockito.mock(AppointmentService.class);
        TreatmentPricingService treatmentPricingService = new TreatmentPricingService();
        BillingService billingService = new BillingService();

        when(appointmentService.findByAppointmentNumber("APT-9999")).thenReturn(Optional.empty());

        BillController controller = new BillController(appointmentService, treatmentPricingService, billingService);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/api/bills/APT-9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Appointment not found"));
    }
}
