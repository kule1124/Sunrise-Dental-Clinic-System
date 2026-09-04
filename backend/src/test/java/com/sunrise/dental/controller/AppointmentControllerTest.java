package com.sunrise.dental.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sunrise.dental.model.Appointment;
import com.sunrise.dental.repository.AppointmentRepository;
import com.sunrise.dental.service.AppointmentService;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AppointmentControllerTest {

    private final AppointmentRepository repository = org.mockito.Mockito.mock(AppointmentRepository.class);
    private final AppointmentService service = new AppointmentService(repository);
    private final AppointmentController controller = new AppointmentController(service);
    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void shouldRegisterAppointment() throws Exception {
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

        when(repository.save(any(Appointment.class))).thenReturn(appointment);

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointment)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.appointmentNumber").value("APT-1001"))
                .andExpect(jsonPath("$.patientName").value("Nimal Perera"));
    }
}
