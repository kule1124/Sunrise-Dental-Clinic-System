package com.sunrise.dental.service;

import com.sunrise.dental.model.Appointment;
import com.sunrise.dental.repository.AppointmentRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Appointment createAppointment(Appointment appointment) {
        validateAppointment(appointment);
        String appointmentNumber = appointment.getAppointmentNumber().trim();
        if (appointmentRepository.existsByAppointmentNumber(appointmentNumber)) {
            throw new IllegalArgumentException("Appointment number already exists");
        }
        appointment.setAppointmentNumber(appointmentNumber);
        return appointmentRepository.save(appointment);
    }

    public Optional<Appointment> findByAppointmentNumber(String appointmentNumber) {
        if (appointmentNumber == null || appointmentNumber.isBlank()) {
            throw new IllegalArgumentException("Appointment number is required");
        }
        return appointmentRepository.findByAppointmentNumber(appointmentNumber.trim());
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> updateAppointment(String appointmentNumber, Appointment appointmentDetails) {
        Optional<Appointment> existingAppointment = findByAppointmentNumber(appointmentNumber);
        
        if (existingAppointment.isPresent()) {
            Appointment appointment = existingAppointment.get();
            
            if (appointmentDetails.getPatientName() != null && !appointmentDetails.getPatientName().isBlank()) {
                appointment.setPatientName(appointmentDetails.getPatientName());
            }
            if (appointmentDetails.getAddress() != null && !appointmentDetails.getAddress().isBlank()) {
                appointment.setAddress(appointmentDetails.getAddress());
            }
            if (appointmentDetails.getContactNumber() != null && !appointmentDetails.getContactNumber().isBlank()) {
                appointment.setContactNumber(appointmentDetails.getContactNumber());
            }
            if (appointmentDetails.getDentistName() != null && !appointmentDetails.getDentistName().isBlank()) {
                appointment.setDentistName(appointmentDetails.getDentistName());
            }
            if (appointmentDetails.getTreatmentType() != null && !appointmentDetails.getTreatmentType().isBlank()) {
                appointment.setTreatmentType(appointmentDetails.getTreatmentType());
            }
            if (appointmentDetails.getAppointmentDate() != null) {
                appointment.setAppointmentDate(appointmentDetails.getAppointmentDate());
            }
            if (appointmentDetails.getAppointmentTime() != null) {
                appointment.setAppointmentTime(appointmentDetails.getAppointmentTime());
            }
            if (appointmentDetails.getStatus() != null && !appointmentDetails.getStatus().isBlank()) {
                appointment.setStatus(appointmentDetails.getStatus());
            }
            
            return Optional.of(appointmentRepository.save(appointment));
        }
        
        return Optional.empty();
    }

    public boolean deleteAppointment(String appointmentNumber) {
        Optional<Appointment> appointment = findByAppointmentNumber(appointmentNumber);
        
        if (appointment.isPresent()) {
            appointmentRepository.delete(appointment.get());
            return true;
        }
        
        return false;
    }

    private void validateAppointment(Appointment appointment) {
        if (appointment == null) {
            throw new IllegalArgumentException("Appointment is required");
        }
        if (appointment.getAppointmentNumber() == null || appointment.getAppointmentNumber().isBlank()) {
            throw new IllegalArgumentException("Appointment number is required");
        }
        if (!appointment.getAppointmentNumber().trim().matches("APT-[0-9]{4,}")) {
            throw new IllegalArgumentException("Appointment number must use format APT-1001");
        }
        if (appointment.getPatientName() == null || appointment.getPatientName().isBlank()) {
            throw new IllegalArgumentException("Patient name is required");
        }
        if (!appointment.getPatientName().trim().matches("[A-Za-z][A-Za-z .'-]{1,59}")) {
            throw new IllegalArgumentException("Patient name contains invalid characters");
        }
        if (appointment.getAddress() == null || appointment.getAddress().isBlank()) {
            throw new IllegalArgumentException("Address is required");
        }
        if (appointment.getAddress().trim().length() > 150) {
            throw new IllegalArgumentException("Address must be 150 characters or fewer");
        }
        if (appointment.getContactNumber() == null || appointment.getContactNumber().isBlank()) {
            throw new IllegalArgumentException("Contact number is required");
        }
        if (!appointment.getContactNumber().trim().matches("0[0-9]{9}")) {
            throw new IllegalArgumentException("Contact number must contain 10 digits and start with 0");
        }
        if (appointment.getDentistName() == null || appointment.getDentistName().isBlank()) {
            throw new IllegalArgumentException("Dentist name is required");
        }
        if (!appointment.getDentistName().trim().matches("[A-Za-z][A-Za-z .'-]{1,59}")) {
            throw new IllegalArgumentException("Dentist name contains invalid characters");
        }
        if (appointment.getTreatmentType() == null || appointment.getTreatmentType().isBlank()) {
            throw new IllegalArgumentException("Treatment type is required");
        }
        if (appointment.getAppointmentDate() == null) {
            throw new IllegalArgumentException("Appointment date is required");
        }
        if (appointment.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the past");
        }
        if (appointment.getAppointmentTime() == null) {
            throw new IllegalArgumentException("Appointment time is required");
        }
    }
}
