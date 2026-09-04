# Sunrise Dental Clinic System

Appointment, patient, treatment-pricing, and billing management for a dental clinic. The project contains a Spring Boot REST API, a browser-based frontend, and a MySQL schema with H2 support for tests.

## Release candidate

**Target release:** `v1.0.0` (latest frontend and backend feature set)  
**Status:** ready for public GitHub publication and frontend deployment  
**Frontend:** `frontend/index.html`  
**Backend:** Spring Boot application in `backend/`

The assignment evidence for Task D is maintained in [docs/version-control-and-deployment-report.md](docs/version-control-and-deployment-report.md). It records the repository setup, daily versioning model, Git techniques, CI/CD workflow, deployment boundary, and screenshot evidence required for assessment.

## Features

- Role-based staff and administrator dashboards
- Login and account registration flows
- Appointment creation, search, status tracking, and dashboard metrics
- Patient record and treatment information management
- Treatment pricing and bill/receipt generation
- Profile editing and profile-photo support in browser storage
- Help section and responsive frontend layout
- REST API validation and automated backend tests

## Technology stack

- Java 17, Spring Boot 3.3.3, Maven
- Spring Web, Spring Data JPA, Bean Validation
- MySQL for deployment and H2 for test execution
- HTML, CSS, and vanilla JavaScript frontend
- GitHub Actions for build, test, and frontend deployment

## Run locally

### Backend

1. Create the database using `database/schema.sql`.
2. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` as environment variables when required.
3. From `backend/`, run:

```text
mvn spring-boot:run
```

The API starts on `http://localhost:8080` by default.

### Frontend

Open `frontend/index.html` in a browser, or serve `frontend/` with any static web server. The frontend tries the local API ports configured at the top of `frontend/app.js`.

### Tests

From `backend/`, run:

```text
mvn test
```

## Repository and deployment

The intended public repository URL is recorded in the Task D report after publication. The workflow at `.github/workflows/ci-and-deploy.yml` builds and tests the backend, then publishes the latest `frontend/` directory to GitHub Pages when changes reach `main`. Database credentials and other secrets must remain in GitHub Actions or hosting-provider configuration and must never be committed.

## Project structure

```text
backend/      Spring Boot API, services, repositories, and tests
database/     MySQL schema and database notes
frontend/     Browser UI and static assets
docs/         Version-control, CI/CD, deployment, and screenshot evidence
.github/      GitHub Actions workflow and modernization artifacts
```

Version 2 - Project documentation updated

Version 3 - System features updated
