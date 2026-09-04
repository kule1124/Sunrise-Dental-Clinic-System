package com.sunrise.dental.service;

import com.sunrise.dental.model.UserAccount;
import com.sunrise.dental.repository.UserAccountRepository;
import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String ADMIN = "ADMIN";
    private static final String STAFF = "STAFF";

    private final UserAccountRepository userAccountRepository;
    private final Map<String, UserAccount> users = new ConcurrentHashMap<>();

    public AuthService() {
        this.userAccountRepository = null;
    }

    @Autowired
    public AuthService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Value("${sunrise.demo.username:clinicadmin}")
    private String demoUsername = "clinicadmin";

    @Value("${sunrise.demo.password:clinicpass}")
    private String demoPassword = "clinicpass";

    @Value("${sunrise.demo.admin.username:admin}")
    private String demoAdminUsername = "admin";

    @Value("${sunrise.demo.admin.password:admin123}")
    private String demoAdminPassword = "admin123";

    @Value("${sunrise.demo.staff.username:staff}")
    private String demoStaffUsername = "staff";

    @Value("${sunrise.demo.staff.password:staff123}")
    private String demoStaffPassword = "staff123";

    @PostConstruct
    void seedDemoAccounts() {
        if (userAccountRepository == null) {
            return;
        }
        saveDemoAccount(demoAdminUsername, demoAdminPassword, ADMIN, "Admin");
        saveDemoAccount(demoStaffUsername, demoStaffPassword, STAFF, "Staff");
        saveDemoAccount(demoUsername, demoPassword, STAFF, "Clinic Admin");
    }

    private void saveDemoAccount(String username, String password, String role, String fullName) {
        if (!userAccountRepository.existsByUsername(username)) {
            userAccountRepository.save(new UserAccount(username, password, role, fullName, "", ""));
        }
    }

    public boolean login(String username, String password) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        String trimmedUsername = username.trim();
        if (userAccountRepository != null) {
            return userAccountRepository.findByUsername(trimmedUsername)
                    .map(account -> account.getPasswordHash().equals(password))
                    .orElse(false);
        }

        if (users.containsKey(trimmedUsername)) {
            UserAccount account = users.get(trimmedUsername);
            return account.getPasswordHash().equals(password);
        }

        if (demoAdminUsername.equals(trimmedUsername) && demoAdminPassword.equals(password)) {
            return true;
        }
        if (demoStaffUsername.equals(trimmedUsername) && demoStaffPassword.equals(password)) {
            return true;
        }
        return demoUsername.equals(trimmedUsername) && demoPassword.equals(password);
    }

    public String getUserRole(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        String trimmedUsername = username.trim();
        if (userAccountRepository != null) {
            return userAccountRepository.findByUsername(trimmedUsername)
                    .map(UserAccount::getRole)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }

        if (users.containsKey(trimmedUsername)) {
            return users.get(trimmedUsername).getRole();
        }

        if (demoAdminUsername.equals(trimmedUsername)) {
            return ADMIN;
        }
        if (demoStaffUsername.equals(trimmedUsername)) {
            return STAFF;
        }
        if (demoUsername.equals(trimmedUsername)) {
            return STAFF;
        }

        throw new IllegalArgumentException("User not found");
    }

    public boolean register(String username, String password) {
        return register(username, password, STAFF, "", "", "");
    }

    public boolean register(String username, String password, String role) {
        return register(username, password, role, "", "", "");
    }

    public boolean register(String username, String password, String role, String fullName, String email, String phoneNumber) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        String trimmedUsername = username.trim();
        String trimmedRole = normalizeRole(role);
        String trimmedFullName = fullName == null ? "" : fullName.trim();
        String trimmedEmail = email == null ? "" : email.trim();
        String trimmedPhoneNumber = phoneNumber == null ? "" : phoneNumber.trim();

        if ((userAccountRepository != null && userAccountRepository.existsByUsername(trimmedUsername))
                || (userAccountRepository == null && users.containsKey(trimmedUsername))
                || demoUsername.equals(trimmedUsername)
                || demoAdminUsername.equals(trimmedUsername)
                || demoStaffUsername.equals(trimmedUsername)) {
            throw new IllegalArgumentException("Username already exists");
        }

        UserAccount account = new UserAccount(trimmedUsername, password, trimmedRole, trimmedFullName,
                trimmedEmail, trimmedPhoneNumber);
        if (userAccountRepository != null) {
            userAccountRepository.save(account);
        } else {
            users.put(trimmedUsername, account);
        }
        return true;
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return STAFF;
        }

        String normalized = role.trim().toUpperCase();
        if (ADMIN.equals(normalized) || STAFF.equals(normalized)) {
            return normalized;
        }

        throw new IllegalArgumentException("Role must be ADMIN or STAFF");
    }

}
