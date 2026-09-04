package com.sunrise.dental.controller;

import com.sunrise.dental.model.Appointment;
import com.sunrise.dental.service.AppointmentService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleValidationError(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @PostMapping("/appointments")
    public ResponseEntity<Appointment> registerAppointment(@RequestBody Appointment appointment) {
        Appointment savedAppointment = appointmentService.createAppointment(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAppointment);
    }

    @GetMapping("/appointments/{appointmentNumber}")
    public ResponseEntity<Appointment> getAppointmentByNumber(@PathVariable String appointmentNumber) {
        Optional<Appointment> appointment = appointmentService.findByAppointmentNumber(appointmentNumber);
        return appointment.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PutMapping("/appointments/{appointmentNumber}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable String appointmentNumber,
                                                          @RequestBody Appointment appointment) {
        Optional<Appointment> updated = appointmentService.updateAppointment(appointmentNumber, appointment);
        return updated.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/appointments/{appointmentNumber}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable String appointmentNumber) {
        boolean deleted = appointmentService.deleteAppointment(appointmentNumber);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
