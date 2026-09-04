package com.sunrise.dental.service;

import com.sunrise.dental.model.Appointment;
import com.sunrise.dental.model.Bill;
import com.sunrise.dental.repository.BillRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BillingService {

    private static final BigDecimal CONSULTATION_FEE = new BigDecimal("500.00");

    private final BillRepository billRepository;
    private final TreatmentPricingService treatmentPricingService;

    public BillingService() {
        this.billRepository = null;
        this.treatmentPricingService = new TreatmentPricingService();
    }

    @Autowired
    public BillingService(BillRepository billRepository, TreatmentPricingService treatmentPricingService) {
        this.billRepository = billRepository;
        this.treatmentPricingService = treatmentPricingService;
    }

    public BigDecimal getConsultationFee() {
        return CONSULTATION_FEE;
    }

    public BigDecimal calculateTotalAmount(BigDecimal treatmentCost) {
        if (treatmentCost == null) {
            throw new IllegalArgumentException("Treatment cost is required");
        }
        return treatmentCost.add(CONSULTATION_FEE);
    }

    public Optional<Bill> findByAppointmentNumber(String appointmentNumber) {
        if (billRepository == null) {
            return Optional.empty();
        }
        if (appointmentNumber == null || appointmentNumber.isBlank()) {
            throw new IllegalArgumentException("Appointment number is required");
        }
        return billRepository.findByAppointmentNumber(appointmentNumber.trim());
    }

    public Bill generateBill(Appointment appointment) {
        if (appointment == null) {
            throw new IllegalArgumentException("Appointment is required");
        }

        if (appointment.getTreatmentType() == null || appointment.getTreatmentType().isBlank()) {
            throw new IllegalArgumentException("Treatment type is required");
        }

        BigDecimal treatmentCost = treatmentPricingService.calculateCost(appointment.getTreatmentType());
        BigDecimal totalAmount = calculateTotalAmount(treatmentCost);

        String receiptNumber = "RCPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Bill bill = new Bill(
                appointment.getAppointmentNumber(),
                appointment.getPatientName(),
                appointment.getDentistName(),
                appointment.getTreatmentType(),
                treatmentCost,
                CONSULTATION_FEE,
                totalAmount,
                LocalDate.now(),
                receiptNumber
        );

        if (billRepository == null) {
            return bill;
        }

        return billRepository.save(bill);
    }
}
