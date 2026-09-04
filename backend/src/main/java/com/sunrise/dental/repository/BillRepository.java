package com.sunrise.dental.repository;

import com.sunrise.dental.model.Bill;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByAppointmentNumber(String appointmentNumber);
}
