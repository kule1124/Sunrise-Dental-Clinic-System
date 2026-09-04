package com.sunrise.dental.controller;

import com.sunrise.dental.model.Appointment;
import com.sunrise.dental.model.Bill;
import com.sunrise.dental.service.AppointmentService;
import com.sunrise.dental.service.BillingService;
import com.sunrise.dental.service.TreatmentPricingService;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class BillController {

    private final AppointmentService appointmentService;
    private final TreatmentPricingService treatmentPricingService;
    private final BillingService billingService;

    public BillController() {
        this.appointmentService = null;
        this.treatmentPricingService = new TreatmentPricingService();
        this.billingService = new BillingService();
    }

    @Autowired
    public BillController(AppointmentService appointmentService,
                         TreatmentPricingService treatmentPricingService,
                         BillingService billingService) {
        this.appointmentService = appointmentService;
        this.treatmentPricingService = treatmentPricingService;
        this.billingService = billingService;
    }

    @GetMapping("/bills/{appointmentNumber}")
    public ResponseEntity<Map<String, Object>> generateBill(@PathVariable String appointmentNumber) {
        Optional<Appointment> appointmentFound = appointmentService.findByAppointmentNumber(appointmentNumber);

        if (appointmentFound.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Appointment not found"));
        }

        Appointment appointment = appointmentFound.get();
        Bill bill = billingService.findByAppointmentNumber(appointmentNumber)
                .orElseGet(() -> billingService.generateBill(appointment));

        Map<String, Object> response = Map.of(
                "appointmentNumber", bill.getAppointmentNumber(),
                "patientName", bill.getPatientName(),
                "dentistName", bill.getDentistName(),
                "treatmentType", bill.getTreatmentType(),
                "treatmentCost", bill.getTreatmentCost(),
                "consultationFee", bill.getConsultationFee(),
                "totalAmount", bill.getTotalAmount(),
                "receiptNumber", bill.getReceiptNumber(),
                "billDate", bill.getBillDate(),
                "message", "Bill generated successfully"
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/bills/{appointmentNumber}/receipt")
    public ResponseEntity<Map<String, Object>> generateReceipt(@PathVariable String appointmentNumber) {
        return generateBill(appointmentNumber);
    }
}
