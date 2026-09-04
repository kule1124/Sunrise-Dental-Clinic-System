package com.sunrise.dental.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class AuthServiceTest {

    @Test
    void shouldAcceptValidCredentials() {
        AuthService service = new AuthService();
        ReflectionTestUtils.setField(service, "demoUsername", "clinicadmin");
        ReflectionTestUtils.setField(service, "demoPassword", "clinicpass");

        assertTrue(service.login("clinicadmin", "clinicpass"));
    }

    @Test
    void shouldRejectInvalidCredentials() {
        AuthService service = new AuthService();
        ReflectionTestUtils.setField(service, "demoUsername", "clinicadmin");
        ReflectionTestUtils.setField(service, "demoPassword", "clinicpass");

        assertFalse(service.login("clinicadmin", "wrongpass"));
    }

    @Test
    void shouldRejectBlankUsername() {
        AuthService service = new AuthService();

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.login("", "clinicpass")
        );

        assertTrue(exception.getMessage().contains("Username is required"));
    }

    @Test
    void shouldCreateNewAccountAndAllowLogin() {
        AuthService service = new AuthService();

        assertTrue(service.register("newuser", "newpass"));
        assertTrue(service.login("newuser", "newpass"));
    }

    @Test
    void shouldStoreRegistrationProfileDetails() {
        AuthService service = new AuthService();

        assertTrue(service.register("profileuser", "profilepass", "STAFF", "Nimal Silva", "nimal@example.com", "0771234567"));
        assertTrue(service.login("profileuser", "profilepass"));
        assertTrue(service.getUserRole("profileuser").equals("STAFF"));
    }

    @Test
    void shouldStoreAndReturnRoleForRegisteredUser() {
        AuthService service = new AuthService();

        assertTrue(service.register("adminuser", "adminpass", "ADMIN"));
        assertTrue(service.login("adminuser", "adminpass"));
        assertTrue(service.getUserRole("adminuser").equals("ADMIN"));
    }

    @Test
    void shouldSupportDemoAdminAndStaffAccounts() {
        AuthService service = new AuthService();

        assertTrue(service.login("admin", "admin123"));
        assertTrue(service.login("staff", "staff123"));
        assertTrue(service.getUserRole("admin").equals("ADMIN"));
        assertTrue(service.getUserRole("staff").equals("STAFF"));
    }

    @Test
    void shouldRejectDuplicateAccount() {
        AuthService service = new AuthService();
        service.register("newuser", "newpass");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.register("newuser", "anotherpass")
        );

        assertTrue(exception.getMessage().contains("already exists"));
    }
}
