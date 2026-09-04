# Database design overview

This database layer is planned to support the Sunrise Dental Clinic assignment requirements.

## Main goals
- store patient and appointment data securely
- support appointment lookups by appointment number
- calculate treatment cost based on treatment type and consultation fee
- keep billing and appointment information separate from the UI layer

## Proposed database structure
- users: login and access management
- patients: personal details and contact information
- appointments: appointment number, date, time, dentist, treatment type, status
- treatment_types: available dental treatments and their base fees

## Design choices
- use a relational database because the system is centered on appointment records and patient history
- use MySQL for the main environment and H2 for local/test execution
- keep database credentials out of source code and use environment-based or profile-based configuration
- use a clear table naming strategy that supports future DAO and service layer work
