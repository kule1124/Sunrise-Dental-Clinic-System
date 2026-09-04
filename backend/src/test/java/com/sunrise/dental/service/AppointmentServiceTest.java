package com.sunrise.dental.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.sunrise.dental.model.Appointment;
import com.sunrise.dental.repository.AppointmentRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class AppointmentServiceTest {

    @Test
    void shouldCreateAppointmentWhenDataIsValid() {
        AppointmentRepository repository = Mockito.mock(AppointmentRepository.class);
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

        Appointment savedAppointment = new Appointment(
                "APT-1001",
                "Nimal Perera",
                "Colombo 07",
                "0771234567",
                "Dr. Silva",
                "Dental Cleaning",
                LocalDate.of(2026, 9, 10),
                LocalTime.of(10, 30)
        );
        savedAppointment.setId(1L);

        Mockito.when(repository.save(appointment)).thenReturn(savedAppointment);

        AppointmentService service = new AppointmentService(repository);
        Appointment result = service.createAppointment(appointment);

        assertNotNull(result);
        assertEquals("APT-1001", result.getAppointmentNumber());
        assertEquals("Nimal Perera", result.getPatientName());
    }

    @Test
    void shouldRejectAppointmentWhenPatientNameMissing() {
        AppointmentRepository repository = Mockito.mock(AppointmentRepository.class);
        Appointment appointment = new Appointment(
                "APT-1002",
                "",
                "Colombo 03",
                "0719876543",
                "Dr. Fernando",
                "Dental Checkup",
                LocalDate.of(2026, 9, 12),
                LocalTime.of(11, 0)
        );

        AppointmentService service = new AppointmentService(repository);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.createAppointment(appointment)
        );

        assertEquals("Patient name is required", exception.getMessage());
    }

        @Test
        void shouldRejectAppointmentWhenDateIsInThePast() {
                AppointmentRepository repository = Mockito.mock(AppointmentRepository.class);
                Appointment appointment = new Appointment(
                                "APT-1003", "Nimal Perera", "Colombo 03", "0719876543", "Dr. Fernando",
                                "Dental Checkup", LocalDate.now().minusDays(1), LocalTime.of(11, 0)
                );

                AppointmentService service = new AppointmentService(repository);

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> service.createAppointment(appointment)
                );

                assertEquals("Appointment date cannot be in the past", exception.getMessage());
                Mockito.verify(repository, Mockito.never()).save(Mockito.any());
        }

        @Test
        void shouldRejectAppointmentWhenContactNumberIsInvalid() {
                AppointmentRepository repository = Mockito.mock(AppointmentRepository.class);
                Appointment appointment = new Appointment(
                                "APT-1004", "Nimal Perera", "Colombo 03", "12345", "Dr. Fernando",
                                "Dental Checkup", LocalDate.now().plusDays(1), LocalTime.of(11, 0)
                );

                AppointmentService service = new AppointmentService(repository);

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> service.createAppointment(appointment)
                );

                assertEquals("Contact number must contain 10 digits and start with 0", exception.getMessage());
        }
}
