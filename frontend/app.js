const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const appointmentForm = document.getElementById('appointmentForm');
const searchForm = document.getElementById('searchForm');
const billingForm = document.getElementById('billingForm');
const billingSubmitButton = document.getElementById('billingSubmitButton');
const loginPanel = document.getElementById('login-panel');
const homePanel = document.getElementById('home-panel');
const registerPanel = document.getElementById('register-panel');
const appointmentPanel = document.getElementById('appointment-panel');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const appointmentMessage = document.getElementById('appointmentMessage');
const searchMessage = document.getElementById('searchMessage');
const billingMessage = document.getElementById('billingMessage');
const exitButton = document.getElementById('exitButton');
const appointmentDetails = document.getElementById('appointmentDetails');
const billingSummary = document.getElementById('billingSummary');
const generateReceiptButton = document.getElementById('generateReceiptButton');
const printReceiptButton = document.getElementById('printReceiptButton');
const showRegisterButton = document.getElementById('showRegisterButton');
const backToLoginButton = document.getElementById('backToLoginButton');
const homeLoginButton = document.getElementById('homeLoginButton');
const adminActionForms = document.getElementById('adminActionForms');

document.querySelectorAll('input[type="date"][id$="AppointmentDate" i]').forEach((dateInput) => {
    dateInput.min = new Date().toISOString().split('T')[0];
});
const API_BASE_URLS = [
    'http://localhost:9090',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083'
];

let currentUserRole = 'STAFF';
let currentUserUsername = 'staff';
const USER_STORAGE_KEY = 'sunrise-clinic-users';
let currentUserDisplayName = 'Admin';

function normalizeRole(role) {
    return String(role || 'STAFF').trim().toUpperCase();
}

function getStoredUsers() {
    const fallbackUsers = [
        { username: 'admin', role: 'ADMIN', fullName: 'Admin' },
        { username: 'staff', role: 'STAFF', fullName: 'Staff' }
    ];

    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUsers));
            return fallbackUsers;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUsers));
            return fallbackUsers;
        }

        return parsed;
    } catch (error) {
        return fallbackUsers;
    }
}

function setStoredUsers(users) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function getDefaultDisplayName(username) {
    const storedUsers = getStoredUsers();
    const match = storedUsers.find((user) => String(user.username).toLowerCase() === String(username || '').toLowerCase());
    return match && match.fullName ? match.fullName : 'Admin';
}

function updateAdminUserLabel(username) {
    const displayNameEl = document.getElementById('adminDisplayName');
    const adminAvatarEl = document.getElementById('adminAvatar');

    if (displayNameEl) {
        const resolvedName = getDefaultDisplayName(username) || currentUserDisplayName || 'Admin';
        displayNameEl.textContent = resolvedName;
        currentUserDisplayName = resolvedName;
    }

    if (adminAvatarEl) {
        const initial = (currentUserDisplayName || 'Admin').trim().charAt(0).toUpperCase() || 'A';
        adminAvatarEl.textContent = initial;
    }
}

function renderRoleBasedUI() {
    const staffDashboard = document.getElementById('staffDashboard');
    const adminDashboard = document.getElementById('adminDashboard');
    const roleDashboard = document.getElementById('roleDashboard');

    if (!staffDashboard || !adminDashboard || !roleDashboard) {
        return;
    }

    const normalizedRole = normalizeRole(currentUserRole);
    roleDashboard.classList.remove('hidden');

    if (normalizedRole === 'ADMIN') {
        staffDashboard.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        updateAdminUserLabel(currentUserDisplayName || 'admin');
    } else {
        adminDashboard.classList.add('hidden');
        staffDashboard.classList.remove('hidden');
        updateStaffUserLabel();
        loadStaffDashboardMetrics();
    }
}

function getProfilePhotoData() {
    const username = String(currentUserDisplayName || currentUserRole || 'staff').toLowerCase();
    const stored = localStorage.getItem('sunrise-staff-profile-photo');
    if (!stored) return null;

    try {
        const parsed = JSON.parse(stored);
        return parsed && parsed[username] ? parsed[username] : null;
    } catch (error) {
        return null;
    }
}

function setProfilePhotoData(dataUrl) {
    const username = String(currentUserDisplayName || currentUserRole || 'staff').toLowerCase();
    const stored = localStorage.getItem('sunrise-staff-profile-photo');
    const allPhotos = stored ? JSON.parse(stored) : {};
    allPhotos[username] = dataUrl;
    localStorage.setItem('sunrise-staff-profile-photo', JSON.stringify(allPhotos));
}

function getCurrentStaffProfile() {
    const users = getStoredUsers();
    const lookupUsername = currentUserUsername || 'staff';
    return users.find((user) => String(user.username).toLowerCase() === String(lookupUsername).toLowerCase()) || {
        username: lookupUsername,
        fullName: currentUserDisplayName || 'Staff',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'STAFF'
    };
}

function getCurrentAdminProfile() {
    const users = getStoredUsers();
    const lookupUsername = currentUserUsername || 'admin';
    return users.find((user) => String(user.username).toLowerCase() === String(lookupUsername).toLowerCase()) || {
        username: lookupUsername,
        fullName: currentUserDisplayName || 'Admin',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'ADMIN'
    };
}

function populateStaffProfileForm() {
    const profile = getCurrentStaffProfile();
    const fullNameEl = document.getElementById('staffProfileFullName');
    const emailEl = document.getElementById('staffProfileEmail');
    const phoneEl = document.getElementById('staffProfilePhone');
    const usernameEl = document.getElementById('staffProfileUsername');
    const roleEl = document.getElementById('staffProfileRole');
    const passwordEl = document.getElementById('staffProfilePassword');
    const avatarEl = document.getElementById('staffProfileAvatar');

    if (fullNameEl) fullNameEl.value = profile.fullName || '';
    if (emailEl) emailEl.value = profile.email || '';
    if (phoneEl) phoneEl.value = profile.phoneNumber || '';
    if (usernameEl) usernameEl.value = profile.username || currentUserUsername || 'staff';
    if (roleEl) roleEl.value = normalizeRole(profile.role || currentUserRole || 'STAFF');
    if (passwordEl) passwordEl.value = profile.password || '';

    if (avatarEl) {
        const photoUrl = getProfilePhotoData();
        if (photoUrl) {
            avatarEl.style.backgroundImage = `url('${photoUrl}')`;
            avatarEl.textContent = '';
        } else {
            avatarEl.style.backgroundImage = 'none';
            avatarEl.textContent = (profile.fullName || 'S').trim().charAt(0).toUpperCase() || 'S';
        }
    }
}

function populateAdminProfileForm() {
    const profile = getCurrentAdminProfile();
    const fullNameEl = document.getElementById('adminProfileFullName');
    const emailEl = document.getElementById('adminProfileEmail');
    const phoneEl = document.getElementById('adminProfilePhone');
    const usernameEl = document.getElementById('adminProfileUsername');
    const roleEl = document.getElementById('adminProfileRole');
    const passwordEl = document.getElementById('adminProfilePassword');
    const avatarEl = document.getElementById('adminProfileAvatar');

    if (fullNameEl) fullNameEl.value = profile.fullName || '';
    if (emailEl) emailEl.value = profile.email || '';
    if (phoneEl) phoneEl.value = profile.phoneNumber || '';
    if (usernameEl) usernameEl.value = profile.username || currentUserUsername || 'admin';
    if (roleEl) roleEl.value = normalizeRole(profile.role || currentUserRole || 'ADMIN');
    if (passwordEl) passwordEl.value = profile.password || '';

    if (avatarEl) {
        const photoUrl = getAdminProfilePhotoData();
        if (photoUrl) {
            avatarEl.style.backgroundImage = `url('${photoUrl}')`;
            avatarEl.textContent = '';
        } else {
            avatarEl.style.backgroundImage = 'none';
            avatarEl.textContent = (profile.fullName || 'A').trim().charAt(0).toUpperCase() || 'A';
        }
    }
}

function updateStaffUserLabel() {
    const nameEl = document.getElementById('staffUserName');
    const avatarEl = document.getElementById('staffUserAvatar');
    const resolvedName = getDefaultDisplayName(currentUserUsername || currentUserDisplayName || 'staff') || 'Staff';

    if (nameEl) {
        nameEl.textContent = resolvedName;
    }

    if (avatarEl) {
        const photoUrl = getProfilePhotoData();
        if (photoUrl) {
            avatarEl.style.backgroundImage = `url('${photoUrl}')`;
            avatarEl.textContent = '';
        } else {
            avatarEl.style.backgroundImage = 'none';
            avatarEl.textContent = (resolvedName || 'S').trim().charAt(0).toUpperCase() || 'S';
        }
    }
}

function getAdminProfilePhotoData() {
    const username = String(currentUserUsername || currentUserDisplayName || 'admin').toLowerCase();
    const stored = localStorage.getItem('sunrise-admin-profile-photo');
    if (!stored) return null;

    try {
        const parsed = JSON.parse(stored);
        return parsed && parsed[username] ? parsed[username] : null;
    } catch (error) {
        return null;
    }
}

function setAdminProfilePhotoData(dataUrl) {
    const username = String(currentUserUsername || currentUserDisplayName || 'admin').toLowerCase();
    const stored = localStorage.getItem('sunrise-admin-profile-photo');
    const allPhotos = stored ? JSON.parse(stored) : {};
    allPhotos[username] = dataUrl;
    localStorage.setItem('sunrise-admin-profile-photo', JSON.stringify(allPhotos));
}

function updateAdminUserLabel(username) {
    const displayNameEl = document.getElementById('adminDisplayName');
    const adminAvatarEl = document.getElementById('adminAvatar');

    if (displayNameEl) {
        const resolvedName = getDefaultDisplayName(username) || currentUserDisplayName || 'Admin';
        displayNameEl.textContent = resolvedName;
        currentUserDisplayName = resolvedName;
    }

    if (adminAvatarEl) {
        const photoUrl = getAdminProfilePhotoData();
        if (photoUrl) {
            adminAvatarEl.style.backgroundImage = `url('${photoUrl}')`;
            adminAvatarEl.textContent = '';
        } else {
            adminAvatarEl.style.backgroundImage = 'none';
            const initial = (currentUserDisplayName || 'Admin').trim().charAt(0).toUpperCase() || 'A';
            adminAvatarEl.textContent = initial;
        }
    }
}

function scrollToSection(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.focus?.();
}

function getStatusForAppointment(appointment) {
    const rawStatus = String(appointment?.status || '').trim().toUpperCase();
    if (['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(rawStatus)) {
        return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
    }

    if (!appointment || !appointment.appointmentDate) {
        return 'Pending';
    }

    const dateValue = appointment.appointmentDate;
    const timeValue = appointment.appointmentTime || '00:00';
    const appointmentDateTime = new Date(`${dateValue}T${timeValue}`);
    const now = new Date();

    if (Number.isNaN(appointmentDateTime.getTime())) {
        return 'Pending';
    }

    if (appointmentDateTime < now) {
        return 'Completed';
    }

    const diffHours = (appointmentDateTime - now) / (1000 * 60 * 60);
    if (diffHours <= 48) {
        return 'Confirmed';
    }

    return 'Pending';
}

function getStatusClass(status) {
    const normalized = String(status || 'Pending').toLowerCase();
    if (normalized === 'confirmed') return 'confirmed';
    if (normalized === 'completed') return 'completed';
    if (normalized === 'cancelled') return 'cancelled';
    return 'pending';
}

async function loadAdminDashboardMetrics() {
    const totalPatientsEl = document.getElementById('adminTotalPatients');
    const totalAppointmentsEl = document.getElementById('adminTotalAppointments');
    const totalStaffEl = document.getElementById('adminTotalStaff');
    const totalDentistsEl = document.getElementById('adminTotalDentists');
    const totalTreatmentsEl = document.getElementById('adminTotalTreatments');
    const totalRevenueEl = document.getElementById('adminTotalRevenue');
    const recentAppointmentsTableBody = document.getElementById('recentAppointmentsTableBody');
    const statusPendingEl = document.getElementById('statusPending');
    const statusConfirmedEl = document.getElementById('statusConfirmed');
    const statusCompletedEl = document.getElementById('statusCompleted');
    const statusCancelledEl = document.getElementById('statusCancelled');

    if (!totalPatientsEl || !totalAppointmentsEl || !totalStaffEl || !totalDentistsEl || !totalTreatmentsEl) {
        return;
    }

    try {
        const response = await apiRequest('/api/appointments');
        if (!response.ok) {
            throw new Error('Unable to load appointments');
        }

        const appointments = await response.json();
        const safeAppointments = Array.isArray(appointments) ? appointments : [];
        const uniquePatients = new Set(safeAppointments.map(item => item.patientName).filter(Boolean)).size;
        const uniqueDentists = new Set(safeAppointments.map(item => item.dentistName).filter(Boolean)).size;
        const uniqueTreatments = new Set(safeAppointments.map(item => item.treatmentType).filter(Boolean)).size;

        const staffAccounts = getStoredUsers().filter(user => normalizeRole(user.role) === 'STAFF');
        const staffCount = Math.max(staffAccounts.length, 1);

        let totalRevenue = 0;
        for (const appointment of safeAppointments) {
            const appointmentNumber = appointment?.appointmentNumber;
            if (!appointmentNumber) continue;

            try {
                const billResponse = await apiRequest(`/api/bills/${encodeURIComponent(appointmentNumber)}`);
                if (!billResponse.ok) {
                    continue;
                }
                const bill = await billResponse.json();
                const value = Number(bill?.totalAmount || 0);
                if (!Number.isNaN(value)) {
                    totalRevenue += value;
                }
            } catch (error) {
                // Ignore individual bill failures and keep the dashboard functional.
            }
        }

        totalPatientsEl.textContent = String(uniquePatients);
        totalAppointmentsEl.textContent = String(safeAppointments.length);
        totalStaffEl.textContent = String(staffCount);
        totalDentistsEl.textContent = String(uniqueDentists);
        totalTreatmentsEl.textContent = String(uniqueTreatments);
        if (totalRevenueEl) {
            totalRevenueEl.textContent = `LKR ${Number(totalRevenue || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        const statusCounts = {
            Pending: 0,
            Confirmed: 0,
            Completed: 0,
            Cancelled: 0
        };

        if (recentAppointmentsTableBody) {
            const recent = [...safeAppointments].slice(-5).reverse();
            recentAppointmentsTableBody.innerHTML = recent.length
                ? recent.map((item) => {
                    const status = getStatusForAppointment(item);
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                    return `
                        <tr>
                            <td>${item.appointmentNumber || '—'}</td>
                            <td>${item.patientName || '—'}</td>
                            <td>${item.dentistName || '—'}</td>
                            <td>${item.treatmentType || '—'}</td>
                            <td>${item.appointmentDate || '—'}</td>
                            <td>${item.appointmentTime || '—'}</td>
                            <td><span class="appointment-status-badge ${getStatusClass(status)}">${status}</span></td>
                        </tr>
                    `;
                }).join('')
                : '<tr><td colspan="7">No appointments available.</td></tr>';
        }

        if (statusPendingEl) statusPendingEl.textContent = String(statusCounts.Pending || 0);
        if (statusConfirmedEl) statusConfirmedEl.textContent = String(statusCounts.Confirmed || 0);
        if (statusCompletedEl) statusCompletedEl.textContent = String(statusCounts.Completed || 0);
        if (statusCancelledEl) statusCancelledEl.textContent = String(statusCounts.Cancelled || 0);

        if (!recentAppointmentsTableBody || recentAppointmentsTableBody.innerHTML.trim() === '') {
            if (statusPendingEl) statusPendingEl.textContent = '0';
            if (statusConfirmedEl) statusConfirmedEl.textContent = '0';
            if (statusCompletedEl) statusCompletedEl.textContent = '0';
            if (statusCancelledEl) statusCancelledEl.textContent = '0';
        }
    } catch (error) {
        totalPatientsEl.textContent = '0';
        totalAppointmentsEl.textContent = '0';
        totalStaffEl.textContent = '1';
        totalDentistsEl.textContent = '0';
        totalTreatmentsEl.textContent = '0';
        if (totalRevenueEl) {
            totalRevenueEl.textContent = 'LKR 0.00';
        }

        if (recentAppointmentsTableBody) {
            recentAppointmentsTableBody.innerHTML = '<tr><td colspan="7">No appointments available.</td></tr>';
        }

        if (statusPendingEl) statusPendingEl.textContent = '0';
        if (statusConfirmedEl) statusConfirmedEl.textContent = '0';
        if (statusCompletedEl) statusCompletedEl.textContent = '0';
        if (statusCancelledEl) statusCancelledEl.textContent = '0';
    }
}

async function loadStaffDashboardMetrics() {
    const todayAppointmentsCountEl = document.getElementById('staffTodayAppointmentsCount');
    const pendingCountEl = document.getElementById('staffPendingAppointmentsCount');
    const confirmedCountEl = document.getElementById('staffConfirmedAppointmentsCount');
    const completedCountEl = document.getElementById('staffCompletedAppointmentsCount');
    const totalPatientsCountEl = document.getElementById('staffTotalPatientsCount');
    const todayAppointmentsListEl = document.getElementById('staffTodayAppointmentsList');
    const recentAppointmentsTableBody = document.getElementById('staffRecentAppointmentsTableBody');

    try {
        const response = await apiRequest('/api/appointments');
        if (!response.ok) {
            throw new Error('Unable to load appointments');
        }

        const appointments = await response.json();
        const safeAppointments = Array.isArray(appointments) ? appointments : [];
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        const todayAppointments = safeAppointments.filter((item) => String(item.appointmentDate || '').startsWith(todayString));
        const pendingAppointments = safeAppointments.filter((item) => getStatusForAppointment(item) === 'Pending');
        const confirmedAppointments = safeAppointments.filter((item) => getStatusForAppointment(item) === 'Confirmed');
        const completedAppointments = safeAppointments.filter((item) => getStatusForAppointment(item) === 'Completed');
        const uniquePatients = new Set(safeAppointments.map(item => item.patientName).filter(Boolean)).size;

        if (todayAppointmentsCountEl) todayAppointmentsCountEl.textContent = String(todayAppointments.length);
        if (pendingCountEl) pendingCountEl.textContent = String(pendingAppointments.length);
        if (confirmedCountEl) confirmedCountEl.textContent = String(confirmedAppointments.length);
        if (completedCountEl) completedCountEl.textContent = String(completedAppointments.length);
        if (totalPatientsCountEl) totalPatientsCountEl.textContent = String(uniquePatients);

        if (todayAppointmentsListEl) {
            const sortedToday = [...todayAppointments].sort((a, b) => (a.appointmentTime || '00:00').localeCompare(b.appointmentTime || '00:00'));
            todayAppointmentsListEl.innerHTML = sortedToday.length
                ? sortedToday.slice(0, 6).map((item) => `
                    <div class="mini-list-item">
                        <div>
                            <strong>${item.appointmentTime || '—'}</strong>
                            <span>${item.patientName || '—'}</span>
                        </div>
                        <div>
                            <span>${item.dentistName || '—'}</span>
                            <span>${item.treatmentType || '—'}</span>
                        </div>
                        <span class="appointment-status-badge ${getStatusClass(getStatusForAppointment(item))}">${getStatusForAppointment(item)}</span>
                    </div>
                `).join('')
                : '<div class="mini-list-item"><span>No appointments scheduled today.</span></div>';
        }

        if (recentAppointmentsTableBody) {
            const recent = [...safeAppointments].slice(-6).reverse();
            recentAppointmentsTableBody.innerHTML = recent.length
                ? recent.map((item) => {
                    const status = getStatusForAppointment(item);
                    return `
                        <tr>
                            <td>${item.appointmentNumber || '—'}</td>
                            <td>${item.patientName || '—'}</td>
                            <td>${item.dentistName || '—'}</td>
                            <td>${item.treatmentType || '—'}</td>
                            <td>${item.appointmentDate || '—'}</td>
                            <td>${item.appointmentTime || '—'}</td>
                            <td><span class="appointment-status-badge ${getStatusClass(status)}">${status}</span></td>
                        </tr>
                    `;
                }).join('')
                : '<tr><td colspan="7">No appointments available.</td></tr>';
        }
    } catch (error) {
        if (todayAppointmentsCountEl) todayAppointmentsCountEl.textContent = '0';
        if (pendingCountEl) pendingCountEl.textContent = '0';
        if (confirmedCountEl) confirmedCountEl.textContent = '0';
        if (completedCountEl) completedCountEl.textContent = '0';
        if (totalPatientsCountEl) totalPatientsCountEl.textContent = '0';
        if (todayAppointmentsListEl) todayAppointmentsListEl.innerHTML = '<div class="mini-list-item"><span>No appointments scheduled today.</span></div>';
        if (recentAppointmentsTableBody) recentAppointmentsTableBody.innerHTML = '<tr><td colspan="7">No appointments available.</td></tr>';
    }
}

async function renderReportTable(reportType) {
    const tableContainer = document.getElementById('reportTableContainer');
    const reportTitleEl = document.getElementById('reportTitle');
    const reportMessageEl = document.getElementById('reportMessage');

    if (!tableContainer || !reportTitleEl) return;

    try {
        const appointmentsResponse = await apiRequest('/api/appointments');
        if (!appointmentsResponse.ok) {
            throw new Error('Unable to load appointment data.');
        }

        const appointmentsData = await appointmentsResponse.json();
        const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

        if (reportType === 'appointments') {
            reportTitleEl.textContent = 'Appointment Report';
            const rows = appointments.length
                ? appointments.map((item) => `
                    <tr>
                        <td>${item.appointmentNumber || '—'}</td>
                        <td>${item.patientName || '—'}</td>
                        <td>${item.dentistName || '—'}</td>
                        <td>${item.treatmentType || '—'}</td>
                        <td>${item.appointmentDate || '—'}</td>
                        <td>${item.appointmentTime || '—'}</td>
                        <td>${getStatusForAppointment(item)}</td>
                    </tr>
                `).join('')
                : '<tr><td colspan="7">No appointment records available.</td></tr>';

            tableContainer.innerHTML = `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Appointment No.</th>
                            <th>Patient</th>
                            <th>Dentist</th>
                            <th>Treatment</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
            if (reportMessageEl) {
                reportMessageEl.textContent = 'Appointment report generated successfully.';
                reportMessageEl.style.color = 'green';
            }
            return;
        }

        if (reportType === 'patients') {
            reportTitleEl.textContent = 'Patient Report';
            const patientMap = new Map();
            appointments.forEach((item) => {
                const patientName = item.patientName || 'Unknown Patient';
                const current = patientMap.get(patientName) || { name: patientName, visits: 0, lastVisit: item.appointmentDate || '—' };
                current.visits += 1;
                current.lastVisit = item.appointmentDate || current.lastVisit;
                patientMap.set(patientName, current);
            });

            const rows = patientMap.size
                ? [...patientMap.values()].map((patient) => `
                    <tr>
                        <td>${patient.name}</td>
                        <td>${patient.visits}</td>
                        <td>${patient.lastVisit}</td>
                    </tr>
                `).join('')
                : '<tr><td colspan="3">No patient records available.</td></tr>';

            tableContainer.innerHTML = `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Visit Count</th>
                            <th>Last Visit</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
            if (reportMessageEl) {
                reportMessageEl.textContent = 'Patient report generated successfully.';
                reportMessageEl.style.color = 'green';
            }
            return;
        }

        if (reportType === 'billing') {
            reportTitleEl.textContent = 'Billing / Revenue Report';
            let totalRevenue = 0;
            const rows = await Promise.all(appointments.map(async (appointment) => {
                try {
                    const billResponse = await apiRequest(`/api/bills/${encodeURIComponent(appointment.appointmentNumber || '')}`);
                    if (!billResponse.ok) {
                        return null;
                    }
                    const bill = await billResponse.json();
                    const total = Number(bill?.totalAmount || 0);
                    if (!Number.isNaN(total)) {
                        totalRevenue += total;
                    }
                    return {
                        appointmentNumber: appointment.appointmentNumber || '—',
                        patientName: appointment.patientName || '—',
                        totalAmount: total
                    };
                } catch (error) {
                    return null;
                }
            }));

            const validRows = rows.filter(Boolean);
            const revenueTableRows = validRows.length
                ? validRows.map((bill) => `
                    <tr>
                        <td>${bill.appointmentNumber}</td>
                        <td>${bill.patientName}</td>
                        <td>${formatCurrency(bill.totalAmount)}</td>
                    </tr>
                `).join('')
                : '<tr><td colspan="3">No billing records available.</td></tr>';

            tableContainer.innerHTML = `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Appointment No.</th>
                            <th>Patient</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>${revenueTableRows}</tbody>
                </table>
                <p><strong>Total Revenue:</strong> ${formatCurrency(totalRevenue)}</p>
            `;
            if (reportMessageEl) {
                reportMessageEl.textContent = 'Billing report generated successfully.';
                reportMessageEl.style.color = 'green';
            }
            return;
        }

        tableContainer.innerHTML = '<p class="empty-report-state">Choose a report type to view clinic data.</p>';
        reportTitleEl.textContent = 'Select a report';
    } catch (error) {
        reportTitleEl.textContent = 'Reports unavailable';
        tableContainer.innerHTML = '<p class="empty-report-state">Unable to load the report data from the backend.</p>';
        if (reportMessageEl) {
            reportMessageEl.textContent = 'The backend connection is unavailable.';
            reportMessageEl.style.color = 'red';
        }
    }
}

function showAdminPanelByAction(action) {
    if (!adminActionForms) return;

    const panels = adminActionForms.querySelectorAll('[data-admin-panel]');
    panels.forEach((panel) => panel.classList.add('hidden'));

    let targetPanel = null;

    if (action === 'manage-appointments') {
        targetPanel = adminActionForms.querySelector('[data-admin-panel="manage-appointments"]');
        if (targetPanel) {
            loadManageAppointmentsTable();
        }
    } else if (action === 'patient-records') {
        targetPanel = adminActionForms.querySelector('[data-admin-panel="search-form"]');
    } else if (action === 'calculate-bill') {
        targetPanel = adminActionForms.querySelector('[data-admin-panel="billing-section"]');
    } else if (action === 'reports') {
        targetPanel = adminActionForms.querySelector('[data-admin-panel="reports-panel"]');
        if (targetPanel) {
            const reportMessage = document.getElementById('reportMessage');
            if (reportMessage) {
                reportMessage.textContent = 'Choose a report type to view clinic data.';
                reportMessage.style.color = '#0d7a84';
            }
            const reportTable = document.getElementById('reportTableContainer');
            if (reportTable) {
                reportTable.innerHTML = '<p class="empty-report-state">Choose a report type to view clinic data.</p>';
            }
            const reportTitle = document.getElementById('reportTitle');
            if (reportTitle) {
                reportTitle.textContent = 'Select a report';
            }
        }
    }

    if (targetPanel) {
        targetPanel.classList.remove('hidden');
        adminActionForms.classList.remove('hidden');
        scrollToSection('#adminActionForms');
    }
}

function renderStaffManagementTable() {
    const tableBody = document.getElementById('staffManagementTableBody');
    if (!tableBody) return;

    const users = getStoredUsers();
    const staffUsers = users.filter((user) => normalizeRole(user.role) === 'STAFF' || normalizeRole(user.role) === 'ADMIN');

    tableBody.innerHTML = staffUsers.length
        ? staffUsers.map((user) => `
            <tr>
                <td>${user.fullName || user.username || '—'}</td>
                <td>${user.username || '—'}</td>
                <td>${user.email || '—'}</td>
                <td>${user.phoneNumber || '—'}</td>
                <td>${normalizeRole(user.role)}</td>
                <td>
                    <button type="button" class="secondary-button staff-management-row-action" data-edit-user="${user.username}">Edit</button>
                    <button type="button" class="secondary-button staff-management-row-action" data-delete-user="${user.username}">Delete</button>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="6">No staff users found.</td></tr>';

    tableBody.querySelectorAll('[data-edit-user]').forEach((button) => {
        button.addEventListener('click', () => {
            const username = button.getAttribute('data-edit-user');
            const user = getStoredUsers().find((item) => String(item.username).toLowerCase() === String(username).toLowerCase());
            if (!user) return;

            document.getElementById('staffManagementMode').value = 'edit';
            document.getElementById('staffManagementFullName').value = user.fullName || '';
            document.getElementById('staffManagementEmail').value = user.email || '';
            document.getElementById('staffManagementPhone').value = user.phoneNumber || '';
            document.getElementById('staffManagementUsername').value = user.username || '';
            document.getElementById('staffManagementPassword').value = user.password || '';
            document.getElementById('staffManagementRole').value = normalizeRole(user.role);
            document.getElementById('staffManagementMessage').textContent = 'Editing staff record for ' + (user.fullName || user.username);
            document.getElementById('staffManagementMessage').style.color = '#0d7a84';
        });
    });

    tableBody.querySelectorAll('[data-delete-user]').forEach((button) => {
        button.addEventListener('click', () => {
            const username = button.getAttribute('data-delete-user');
            const users = getStoredUsers();
            const filtered = users.filter((user) => String(user.username).toLowerCase() !== String(username).toLowerCase());
            setStoredUsers(filtered);
            renderStaffManagementTable();
            document.getElementById('staffManagementMessage').textContent = 'Staff record deleted.';
            document.getElementById('staffManagementMessage').style.color = 'green';
        });
    });
}

async function loadManageAppointmentsTable() {
    const tableBody = document.getElementById('manageAppointmentsTableBody');
    const messageEl = document.getElementById('manageAppointmentsMessage');
    
    if (!tableBody) return;

    try {
        const response = await apiRequest('/api/appointments');
        if (!response.ok) {
            throw new Error('Unable to load appointments');
        }

        const appointments = await response.json();
        const safeAppointments = Array.isArray(appointments) ? appointments : [];

        tableBody.innerHTML = safeAppointments.length
            ? safeAppointments.map((appointment) => {
                const status = getStatusForAppointment(appointment);
                const appointmentNumber = appointment.appointmentNumber || '';
                return `
                    <tr>
                        <td>${appointmentNumber || '—'}</td>
                        <td>${appointment.patientName || '—'}</td>
                        <td>${appointment.dentistName || '—'}</td>
                        <td>${appointment.treatmentType || '—'}</td>
                        <td>${appointment.appointmentDate || '—'}</td>
                        <td>${appointment.appointmentTime || '—'}</td>
                        <td><span class="appointment-status-badge ${getStatusClass(status)}">${status}</span></td>
                        <td>
                            <button type="button" class="secondary-button appointment-action" data-action-type="view" data-appointment-number="${appointmentNumber}">View</button>
                            <button type="button" class="secondary-button appointment-action" data-action-type="update" data-appointment-number="${appointmentNumber}">Update</button>
                            <button type="button" class="secondary-button appointment-action" data-action-type="confirm" data-appointment-number="${appointmentNumber}" ${status === 'Confirmed' ? 'disabled' : ''}>Confirm</button>
                            <button type="button" class="secondary-button appointment-action" data-action-type="delete" data-appointment-number="${appointmentNumber}">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="8">No appointments available.</td></tr>';

        // Attach event listeners to action buttons
        tableBody.querySelectorAll('.appointment-action').forEach((button) => {
            button.addEventListener('click', () => {
                const actionType = button.getAttribute('data-action-type');
                const appointmentNumber = button.getAttribute('data-appointment-number');
                handleAppointmentAction(actionType, appointmentNumber, safeAppointments);
            });
        });

        if (messageEl) {
            messageEl.textContent = '';
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="8">Error loading appointments. Please try again.</td></tr>';
        if (messageEl) {
            messageEl.textContent = 'Error loading appointments.';
            messageEl.style.color = '#d9534f';
        }
    }
}

function handleAppointmentAction(actionType, appointmentNumber, appointments) {
    const appointment = appointments.find(a => a.appointmentNumber === appointmentNumber);
    
    if (!appointment) {
        alert('Appointment not found.');
        return;
    }

    switch (actionType) {
        case 'view':
            showViewAppointmentModal(appointment);
            break;
        case 'update':
            showUpdateAppointmentModal(appointment);
            break;
        case 'confirm':
            confirmAppointmentAction(appointmentNumber, appointment);
            break;
        case 'delete':
            deleteAppointmentAction(appointmentNumber, appointment);
            break;
    }
}

function showViewAppointmentModal(appointment) {
    const modal = document.getElementById('viewAppointmentModal');
    const status = getStatusForAppointment(appointment);
    
    document.getElementById('viewAppointmentNumber').textContent = appointment.appointmentNumber || '—';
    document.getElementById('viewPatientName').textContent = appointment.patientName || '—';
    document.getElementById('viewAddress').textContent = appointment.address || '—';
    document.getElementById('viewContactNumber').textContent = appointment.contactNumber || '—';
    document.getElementById('viewDentistName').textContent = appointment.dentistName || '—';
    document.getElementById('viewTreatmentType').textContent = appointment.treatmentType || '—';
    document.getElementById('viewAppointmentDate').textContent = appointment.appointmentDate || '—';
    document.getElementById('viewAppointmentTime').textContent = appointment.appointmentTime || '—';
    document.getElementById('viewStatus').textContent = status;
    
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function showUpdateAppointmentModal(appointment) {
    const modal = document.getElementById('updateAppointmentModal');
    
    document.getElementById('updateAppointmentNumber').value = appointment.appointmentNumber || '';
    document.getElementById('updatePatientName').value = appointment.patientName || '';
    document.getElementById('updateAddress').value = appointment.address || '';
    document.getElementById('updateContactNumber').value = appointment.contactNumber || '';
    document.getElementById('updateDentistName').value = appointment.dentistName || '';
    document.getElementById('updateTreatmentType').value = appointment.treatmentType || 'Dental Cleaning';
    document.getElementById('updateAppointmentDate').value = appointment.appointmentDate || '';
    document.getElementById('updateAppointmentTime').value = appointment.appointmentTime || '';
    document.getElementById('updateStatus').value = getStatusForAppointment(appointment) || 'Pending';
    document.getElementById('updateAppointmentMessage').textContent = '';
    
    if (modal) {
        modal.classList.remove('hidden');
    }
}

async function confirmAppointmentAction(appointmentNumber, appointment) {
    if (!confirm('Are you sure you want to confirm this appointment?')) {
        return;
    }

    try {
        const updateData = {
            patientName: appointment.patientName || '',
            address: appointment.address || '',
            contactNumber: appointment.contactNumber || '',
            dentistName: appointment.dentistName || '',
            treatmentType: appointment.treatmentType || '',
            appointmentDate: appointment.appointmentDate || '',
            appointmentTime: appointment.appointmentTime || '',
            status: 'Confirmed'
        };

        const response = await apiRequest(`/api/appointments/${encodeURIComponent(appointmentNumber)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error('Unable to confirm appointment');
        }

        alert('Appointment confirmed successfully!');
        loadManageAppointmentsTable();
    } catch (error) {
        alert('Error confirming appointment: ' + error.message);
    }
}

async function deleteAppointmentAction(appointmentNumber, appointment) {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await apiRequest(`/api/appointments/${encodeURIComponent(appointmentNumber)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Unable to delete appointment');
        }

        alert('Appointment deleted successfully!');
        loadManageAppointmentsTable();
    } catch (error) {
        alert('Error deleting appointment: ' + error.message);
    }
}

function handleDashboardAction(action) {
    const appointmentPanel = document.getElementById('appointment-panel');
    const appointmentForm = document.getElementById('appointmentForm');
    const searchForm = document.getElementById('searchForm');
    const billingSection = document.getElementById('billingSection');
    const staffPanels = document.querySelectorAll('[data-staff-panel]');

    if (!appointmentPanel) return;

    appointmentPanel.classList.remove('hidden');

    document.querySelectorAll('.report-button').forEach((button) => {
        button.addEventListener('click', async () => {
            const reportType = button.getAttribute('data-report-type');
            if (reportType) {
                await renderReportTable(reportType);
            }
        });
    });

    if (staffPanels.length) {
        staffPanels.forEach((panel) => panel.classList.add('hidden'));
    }

    switch (action) {
        case 'login':
            loginPanel.classList.remove('hidden');
            appointmentPanel.classList.add('hidden');
            document.getElementById('username')?.focus();
            break;
        case 'staff-dashboard':
        case 'admin-dashboard':
            renderRoleBasedUI();
            scrollToSection('#roleDashboard');
            break;
        case 'register-appointment':
            document.querySelector('[data-staff-panel="register-appointment"]')?.classList.remove('hidden');
            scrollToSection('#staffActionForms');
            document.getElementById('staffAppointmentNumber')?.focus();
            break;
        case 'search-appointment':
            document.querySelector('[data-staff-panel="search-appointment"]')?.classList.remove('hidden');
            scrollToSection('#staffActionForms');
            document.getElementById('staffSearchAppointmentNumber')?.focus();
            break;
        case 'patient-records':
            document.querySelector('[data-staff-panel="patient-records"]')?.classList.remove('hidden');
            scrollToSection('#staffActionForms');
            document.getElementById('staffPatientSearch')?.focus();
            break;
        case 'billing':
            document.querySelector('[data-staff-panel="billing"]')?.classList.remove('hidden');
            scrollToSection('#staffActionForms');
            document.getElementById('staffBillingAppointmentNumber')?.focus();
            break;
        case 'help':
            document.querySelector('[data-staff-panel="help"]')?.classList.remove('hidden');
            scrollToSection('#staffActionForms');
            break;
        case 'patient-details':
            scrollToSection('#appointmentForm');
            appointmentForm?.focus();
            appointmentMessage.textContent = 'Step 1: enter patient details and save the appointment.';
            appointmentMessage.style.color = '#0d7a84';
            break;
        case 'new-appointment':
            scrollToSection('#appointmentForm');
            document.getElementById('appointmentNumber')?.focus();
            appointmentMessage.textContent = 'Step 2: register the new appointment details.';
            appointmentMessage.style.color = '#0d7a84';
            break;
        case 'view-appointment':
            scrollToSection('#searchForm');
            document.getElementById('searchAppointmentNumber')?.focus();
            searchMessage.textContent = 'Step 4: view the appointment details after searching.';
            searchMessage.style.color = '#0d7a84';
            break;
        case 'update-appointment':
            scrollToSection('#appointmentForm');
            document.getElementById('appointmentNumber')?.focus();
            appointmentMessage.textContent = 'Step 5: update the appointment by editing the existing record.';
            appointmentMessage.style.color = '#0d7a84';
            break;
        case 'cancel-appointment':
            scrollToSection('#searchForm');
            document.getElementById('searchAppointmentNumber')?.focus();
            searchMessage.textContent = 'Step 6: find the appointment then cancel it from the system.';
            searchMessage.style.color = '#d9534f';
            break;
        case 'calculate-bill':
            showAdminPanelByAction(action);
            scrollToSection('#billingSection');
            document.getElementById('billingAppointmentNumber')?.focus();
            billingMessage.textContent = 'Step 7: enter the appointment number to calculate the bill.';
            billingMessage.style.color = '#0d7a84';
            break;
        case 'generate-receipt':
            scrollToSection('#billingSection');
            document.getElementById('billingAppointmentNumber')?.focus();
            billingMessage.textContent = 'Step 8: generate the receipt after the bill is ready.';
            billingMessage.style.color = '#0d7a84';
            break;
        case 'logout':
            exitButton.click();
            break;
        case 'manage-staff':
            const staffPanel = adminActionForms?.querySelector('[data-admin-panel="staff-management"]');
            if (staffPanel) {
                adminActionForms.querySelectorAll('[data-admin-panel]').forEach((panel) => panel.classList.add('hidden'));
                staffPanel.classList.remove('hidden');
                adminActionForms.classList.remove('hidden');
                scrollToSection('#adminActionForms');
                renderStaffManagementTable();
            }
            break;
        case 'manage-dentists':
        case 'manage-treatments':
            scrollToSection('#roleDashboard');
            appointmentMessage.textContent = 'Admin action selected. Use the dashboard flow to continue with management tasks.';
            appointmentMessage.style.color = '#0d7a84';
            break;
        case 'manage-appointments':
            showAdminPanelByAction(action);
            break;
        case 'reports':
            showAdminPanelByAction(action);
            const reportButtons = document.querySelectorAll('.report-button');
            reportButtons.forEach((button) => {
                button.onclick = async () => {
                    const reportType = button.getAttribute('data-report-type');
                    if (reportType) {
                        await renderReportTable(reportType);
                    }
                };
            });
            break;
        default:
            break;
    }
}

async function apiRequest(path, options = {}) {
    let lastError = null;
    let lastResponse = null;

    for (const baseUrl of API_BASE_URLS) {
        try {
            const response = await fetch(`${baseUrl}${path}`, options);
            lastResponse = response;

            if (response.ok) {
                return response;
            }

            if (response.status === 404 || response.status === 400 || response.status === 401 || response.status === 500) {
                continue;
            }

            return response;
        } catch (error) {
            lastError = error;
        }
    }

    if (lastResponse) {
        return lastResponse;
    }

    throw lastError || new Error('Unable to connect to the backend server.');
}

function showLoginPanel() {
    homePanel.classList.add('hidden');
    loginPanel.classList.remove('hidden');
    registerPanel.classList.add('hidden');
    loginMessage.textContent = '';
    registerMessage.textContent = '';
}

function showRegisterPanel() {
    homePanel.classList.add('hidden');
    loginPanel.classList.add('hidden');
    registerPanel.classList.remove('hidden');
    loginMessage.textContent = '';
    registerMessage.textContent = '';
}

function formatCurrency(value) {
    return 'LKR ' + Number(value).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function clearBillingSummary() {
    billingSummary.classList.add('hidden');
    billingMessage.textContent = '';
}

showRegisterButton.addEventListener('click', showRegisterPanel);
backToLoginButton.addEventListener('click', showLoginPanel);
homeLoginButton.addEventListener('click', showLoginPanel);

document.querySelectorAll('[data-action]').forEach((card) => {
    card.addEventListener('click', () => {
        const action = card.getAttribute('data-action');
        if (action) {
            handleDashboardAction(action);
        }
    });
});

document.querySelectorAll('.staff-management-toggle').forEach((button) => {
    button.addEventListener('click', () => {
        const mode = button.getAttribute('data-staff-action');
        document.getElementById('staffManagementMode').value = mode;
        const messageEl = document.getElementById('staffManagementMessage');
        if (messageEl) {
            messageEl.textContent = 'Staff management mode: ' + mode;
            messageEl.style.color = '#0d7a84';
        }
    });
});

document.getElementById('staffManagementResetButton')?.addEventListener('click', () => {
    document.getElementById('staffManagementForm').reset();
    document.getElementById('staffManagementMode').value = 'add';
    document.getElementById('staffManagementMessage').textContent = 'Form reset.';
    document.getElementById('staffManagementMessage').style.color = '#0d7a84';
});

document.getElementById('staffManagementForm')?.addEventListener('submit', (event) => {
    event.preventDefault();

    const fullName = document.getElementById('staffManagementFullName').value.trim();
    const email = document.getElementById('staffManagementEmail').value.trim();
    const phoneNumber = document.getElementById('staffManagementPhone').value.trim();
    const username = document.getElementById('staffManagementUsername').value.trim();
    const password = document.getElementById('staffManagementPassword').value;
    const role = document.getElementById('staffManagementRole').value;
    const mode = document.getElementById('staffManagementMode').value;

    const users = getStoredUsers();
    const existingIndex = users.findIndex((user) => String(user.username).toLowerCase() === String(username).toLowerCase());

    if (mode === 'edit' && existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], fullName, email, phoneNumber, username, password, role: normalizeRole(role) };
    } else {
        users.push({ fullName, email, phoneNumber, username, password, role: normalizeRole(role) });
    }

    setStoredUsers(users);
    renderStaffManagementTable();
    document.getElementById('staffManagementForm').reset();
    document.getElementById('staffManagementMode').value = 'add';
    document.getElementById('staffManagementMessage').textContent = mode === 'edit' ? 'Staff updated successfully.' : 'Staff added successfully.';
    document.getElementById('staffManagementMessage').style.color = 'green';
});

function positionStaffProfileMenu() {
    const menu = document.getElementById('staffProfileMenu');
    const cardWrap = document.querySelector('.staff-user-card-wrap');
    if (!menu || !cardWrap) return;

    const cardRect = cardWrap.getBoundingClientRect();
    const menuWidth = Math.min(menu.offsetWidth || 180, Math.max(180, window.innerWidth * 0.72));
    const menuHeight = menu.offsetHeight || 180;
    const padding = 12;

    const left = Math.min(
        Math.max(cardRect.left, padding),
        window.innerWidth - menuWidth - padding
    );
    const top = Math.min(
        Math.max(cardRect.bottom + 8, padding),
        window.innerHeight - menuHeight - padding
    );

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
}

function toggleStaffProfileMenu(forceOpen) {
    const menu = document.getElementById('staffProfileMenu');
    const trigger = document.getElementById('staffProfileTrigger');
    const arrow = document.getElementById('staffProfileArrowButton');
    if (!menu) return;

    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !shouldOpen);

    if (shouldOpen) {
        requestAnimationFrame(() => {
            positionStaffProfileMenu();
        });
    }

    if (trigger) trigger.setAttribute('aria-expanded', String(shouldOpen));
    if (arrow) arrow.setAttribute('aria-expanded', String(shouldOpen));
}

document.getElementById('staffProfileTrigger')?.addEventListener('click', () => toggleStaffProfileMenu());
document.getElementById('staffProfileArrowButton')?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleStaffProfileMenu();
});

window.addEventListener('resize', () => {
    const menu = document.getElementById('staffProfileMenu');
    if (menu && !menu.classList.contains('hidden')) {
        positionStaffProfileMenu();
    }
});

document.addEventListener('click', (event) => {
    const profileWrap = document.querySelector('.staff-user-card-wrap');
    if (!profileWrap) return;
    if (!profileWrap.contains(event.target)) {
        toggleStaffProfileMenu(false);
    }
});

function showStaffProfileArea() {
    const staffProfilePage = document.getElementById('staffProfilePage');
    const staffPanels = document.querySelectorAll('[data-staff-panel]');
    const actionForms = document.getElementById('staffActionForms');

    if (staffPanels.length) {
        staffPanels.forEach((panel) => panel.classList.add('hidden'));
    }

    if (actionForms) {
        actionForms.classList.add('hidden');
    }

    if (staffProfilePage) {
        staffProfilePage.classList.remove('hidden');
        populateStaffProfileForm();
        scrollToSection('#staffProfilePage');
    }
}

document.querySelectorAll('[data-profile-action]').forEach((actionButton) => {
    actionButton.addEventListener('click', () => {
        const action = actionButton.getAttribute('data-profile-action');
        const menu = document.getElementById('staffProfileMenu');
        if (menu) menu.classList.add('hidden');

        if (action === 'view' || action === 'edit') {
            showStaffProfileArea();
            const messageEl = document.getElementById('staffProfileMessage');
            if (messageEl) {
                messageEl.textContent = action === 'edit' ? 'Edit your profile details and save the changes.' : 'Your profile details are shown below.';
                messageEl.style.color = '#0d7a84';
            }
        }

        if (action === 'photo') {
            document.getElementById('staffProfilePhotoInput')?.click();
        }

        if (action === 'logout') {
            exitButton.click();
        }
    });
});

document.getElementById('staffProfileCancelButton')?.addEventListener('click', () => {
    const profilePage = document.getElementById('staffProfilePage');
    const actionForms = document.getElementById('staffActionForms');
    if (profilePage) profilePage.classList.add('hidden');
    if (actionForms) actionForms.classList.remove('hidden');
});

document.getElementById('staffProfilePhotoButton')?.addEventListener('click', () => {
    document.getElementById('staffProfilePhotoInput')?.click();
});

document.getElementById('staffProfilePhotoInput')?.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        setProfilePhotoData(reader.result);
        updateStaffUserLabel();
        populateStaffProfileForm();
    };
    reader.readAsDataURL(file);
});

document.getElementById('staffProfileForm')?.addEventListener('submit', (event) => {
    event.preventDefault();

    const profile = getCurrentStaffProfile();
    const fullName = document.getElementById('staffProfileFullName').value.trim();
    const email = document.getElementById('staffProfileEmail').value.trim();
    const phoneNumber = document.getElementById('staffProfilePhone').value.trim();
    const password = document.getElementById('staffProfilePassword').value;

    const users = getStoredUsers();
    const index = users.findIndex((user) => String(user.username).toLowerCase() === String(profile.username || currentUserUsername || 'staff').toLowerCase());

    if (index >= 0) {
        users[index] = {
            ...users[index],
            fullName,
            email,
            phoneNumber,
            password,
            role: normalizeRole(users[index].role || currentUserRole || 'STAFF')
        };
        setStoredUsers(users);
        currentUserDisplayName = fullName || currentUserDisplayName;
    }

    const messageEl = document.getElementById('staffProfileMessage');
    if (messageEl) {
        messageEl.textContent = 'Profile updated successfully.';
        messageEl.style.color = 'green';
    }

    updateStaffUserLabel();
});

document.getElementById('adminProfileTrigger')?.addEventListener('click', () => toggleAdminProfileMenu());
document.getElementById('adminProfileArrowButton')?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleAdminProfileMenu();
});

document.addEventListener('click', (event) => {
    const adminWrap = document.querySelector('.admin-user-card-wrap');
    if (!adminWrap) return;
    if (!adminWrap.contains(event.target)) {
        toggleAdminProfileMenu(false);
    }
});

function positionAdminProfileMenu() {
    const menu = document.getElementById('adminProfileMenu');
    const cardWrap = document.querySelector('.admin-user-card-wrap');
    if (!menu || !cardWrap) return;

    const cardRect = cardWrap.getBoundingClientRect();
    const menuWidth = Math.min(menu.offsetWidth || 180, Math.max(180, window.innerWidth * 0.72));
    const menuHeight = menu.offsetHeight || 180;
    const padding = 12;

    const left = Math.min(
        Math.max(cardRect.left, padding),
        window.innerWidth - menuWidth - padding
    );
    const top = Math.min(
        Math.max(cardRect.bottom + 8, padding),
        window.innerHeight - menuHeight - padding
    );

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
}

function toggleAdminProfileMenu(forceOpen) {
    const menu = document.getElementById('adminProfileMenu');
    const trigger = document.getElementById('adminProfileTrigger');
    const arrow = document.getElementById('adminProfileArrowButton');
    if (!menu) return;

    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !shouldOpen);

    if (shouldOpen) {
        requestAnimationFrame(() => {
            positionAdminProfileMenu();
        });
    }

    if (trigger) trigger.setAttribute('aria-expanded', String(shouldOpen));
    if (arrow) arrow.setAttribute('aria-expanded', String(shouldOpen));
}

window.addEventListener('resize', () => {
    const menu = document.getElementById('adminProfileMenu');
    if (menu && !menu.classList.contains('hidden')) {
        positionAdminProfileMenu();
    }
});

function showAdminProfileArea() {
    const adminProfilePage = document.getElementById('adminProfilePage');
    const summarySection = document.querySelector('.summary-section');
    const actionForms = document.getElementById('adminActionForms');

    if (actionForms) actionForms.classList.add('hidden');
    if (summarySection) summarySection.classList.add('hidden');
    if (adminProfilePage) {
        adminProfilePage.classList.remove('hidden');
        populateAdminProfileForm();
        scrollToSection('#adminProfilePage');
    }
}

document.querySelectorAll('[data-profile-action]').forEach((actionButton) => {
    actionButton.addEventListener('click', () => {
        const action = actionButton.getAttribute('data-profile-action');
        const menu = document.getElementById('adminProfileMenu');
        if (menu) menu.classList.add('hidden');

        if (action === 'view' || action === 'edit') {
            showAdminProfileArea();
            const messageEl = document.getElementById('adminProfileMessage');
            if (messageEl) {
                messageEl.textContent = action === 'edit' ? 'Edit your profile details and save the changes.' : 'Your profile details are shown below.';
                messageEl.style.color = '#0d7a84';
            }
        }

        if (action === 'photo') {
            document.getElementById('adminProfilePhotoInput')?.click();
        }

        if (action === 'logout') {
            exitButton.click();
        }
    });
});

document.getElementById('adminProfileCancelButton')?.addEventListener('click', () => {
    const adminProfilePage = document.getElementById('adminProfilePage');
    const summarySection = document.querySelector('.summary-section');
    if (adminProfilePage) adminProfilePage.classList.add('hidden');
    if (summarySection) summarySection.classList.remove('hidden');
});

document.getElementById('adminProfilePhotoButton')?.addEventListener('click', () => {
    document.getElementById('adminProfilePhotoInput')?.click();
});

document.getElementById('adminProfilePhotoInput')?.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        setAdminProfilePhotoData(reader.result);
        updateAdminUserLabel(currentUserUsername || 'admin');
        populateAdminProfileForm();
    };
    reader.readAsDataURL(file);
});

document.getElementById('adminProfileForm')?.addEventListener('submit', (event) => {
    event.preventDefault();

    const profile = getCurrentAdminProfile();
    const fullName = document.getElementById('adminProfileFullName').value.trim();
    const email = document.getElementById('adminProfileEmail').value.trim();
    const phoneNumber = document.getElementById('adminProfilePhone').value.trim();
    const password = document.getElementById('adminProfilePassword').value;

    const users = getStoredUsers();
    const index = users.findIndex((user) => String(user.username).toLowerCase() === String(profile.username || currentUserUsername || 'admin').toLowerCase());

    if (index >= 0) {
        users[index] = {
            ...users[index],
            fullName,
            email,
            phoneNumber,
            password,
            role: normalizeRole(users[index].role || currentUserRole || 'ADMIN')
        };
        setStoredUsers(users);
        currentUserDisplayName = fullName || currentUserDisplayName;
    }

    const messageEl = document.getElementById('adminProfileMessage');
    if (messageEl) {
        messageEl.textContent = 'Profile updated successfully.';
        messageEl.style.color = 'green';
    }

    updateAdminUserLabel(currentUserUsername || 'admin');
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            currentUserRole = normalizeRole(result.role || 'STAFF');
            currentUserUsername = username.trim();
            currentUserDisplayName = getDefaultDisplayName(currentUserUsername) || 'Admin';
            loginMessage.style.color = 'green';
            loginMessage.textContent = result.message;
            loginPanel.classList.add('hidden');
            appointmentPanel.classList.remove('hidden');
            renderRoleBasedUI();

            if (currentUserRole === 'ADMIN') {
                updateAdminUserLabel(currentUserUsername);
                loadAdminDashboardMetrics();
            }
        } else {
            loginMessage.style.color = 'red';
            loginMessage.textContent = result.message || 'Login failed';
        }
    } catch (error) {
        loginMessage.style.color = 'red';
        loginMessage.textContent = 'Unable to connect to the backend server.';
    }
});

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = document.getElementById('registerFullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phoneNumber = document.getElementById('registerPhoneNumber').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    try {
        const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, phoneNumber, username, password, role })
        });

        const result = await response.json();

        if (response.ok) {
            currentUserRole = normalizeRole(result.role || role || 'STAFF');
            currentUserUsername = username.trim();

            const allUserAccounts = getStoredUsers();
            const accountExists = allUserAccounts.some((user) => String(user.username).toLowerCase() === username.toLowerCase());
            if (!accountExists) {
                allUserAccounts.push({ username, role: normalizeRole(role || 'STAFF'), fullName: fullName || username });
                setStoredUsers(allUserAccounts);
            }

            currentUserDisplayName = fullName || username || 'Admin';
            registerMessage.style.color = 'green';
            registerMessage.textContent = result.message;
            registerForm.reset();
            setTimeout(() => {
                showLoginPanel();
                loginMessage.style.color = 'green';
                loginMessage.textContent = 'Account created successfully. Please login.';
            }, 800);
        } else {
            registerMessage.style.color = 'red';
            registerMessage.textContent = result.message || 'Account creation failed';
        }
    } catch (error) {
        registerMessage.style.color = 'red';
        registerMessage.textContent = 'Unable to connect to the backend server.';
    }
});

appointmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const appointmentPayload = {
        appointmentNumber: document.getElementById('appointmentNumber').value.trim(),
        patientName: document.getElementById('patientName').value.trim(),
        address: document.getElementById('address').value.trim(),
        contactNumber: document.getElementById('contactNumber').value.trim(),
        dentistName: document.getElementById('dentistName').value.trim(),
        treatmentType: document.getElementById('treatmentType').value,
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value
    };

    try {
        const response = await apiRequest('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentPayload)
        });

        const result = await response.json();

        if (response.ok) {
            appointmentMessage.style.color = 'green';
            appointmentMessage.textContent = 'Appointment saved successfully for ' + result.patientName;
            appointmentForm.reset();
        } else {
            appointmentMessage.style.color = 'red';
            appointmentMessage.textContent = result.message || 'Appointment could not be saved.';
        }
    } catch (error) {
        appointmentMessage.style.color = 'red';
        appointmentMessage.textContent = 'Unable to connect to the backend server.';
    }
});

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const appointmentNumber = document.getElementById('searchAppointmentNumber').value.trim();

    try {
        const response = await apiRequest(`/api/appointments/${appointmentNumber}`);
        const result = await response.json();

        if (response.ok) {
            searchMessage.style.color = 'green';
            searchMessage.textContent = 'Appointment found.';
            appointmentDetails.classList.remove('hidden');
            document.getElementById('detailAppointmentNumber').textContent = result.appointmentNumber;
            document.getElementById('detailPatientName').textContent = result.patientName;
            document.getElementById('detailAddress').textContent = result.address;
            document.getElementById('detailContactNumber').textContent = result.contactNumber;
            document.getElementById('detailDentistName').textContent = result.dentistName;
            document.getElementById('detailTreatmentType').textContent = result.treatmentType;
            document.getElementById('detailAppointmentDate').textContent = result.appointmentDate;
            document.getElementById('detailAppointmentTime').textContent = result.appointmentTime;
        } else {
            appointmentDetails.classList.add('hidden');
            searchMessage.style.color = 'red';
            searchMessage.textContent = result.message || 'Appointment not found.';
        }
    } catch (error) {
        appointmentDetails.classList.add('hidden');
        searchMessage.style.color = 'red';
        searchMessage.textContent = 'Unable to connect to the backend server.';
    }
});

if (billingSubmitButton) {
    billingSubmitButton.addEventListener('click', async () => {
        const appointmentNumber = document.getElementById('billingAppointmentNumber').value.trim();

        if (!appointmentNumber) {
            billingMessage.style.color = 'red';
            billingMessage.textContent = 'Appointment number is required.';
            billingSummary.classList.add('hidden');
            return;
        }

        try {
            const response = await apiRequest(`/api/bills/${appointmentNumber}`);
            const result = await response.json();

            if (response.ok) {
                billingMessage.style.color = 'green';
                billingMessage.textContent = result.message || 'Bill generated successfully.';
                billingSummary.classList.remove('hidden');

                document.getElementById('billAppointmentNumber').textContent = result.appointmentNumber;
                document.getElementById('billPatientName').textContent = result.patientName;
                document.getElementById('billDentistName').textContent = result.dentistName;
                document.getElementById('billTreatmentType').textContent = result.treatmentType;
                document.getElementById('billTreatmentCost').textContent = formatCurrency(result.treatmentCost);
                document.getElementById('billConsultationFee').textContent = formatCurrency(result.consultationFee);
                document.getElementById('billTotalAmount').textContent = formatCurrency(result.totalAmount);
                document.getElementById('billReceiptNumber').textContent = result.receiptNumber;
            } else {
                billingSummary.classList.add('hidden');
                billingMessage.style.color = 'red';
                billingMessage.textContent = result.message || 'Invalid appointment number.';
            }
        } catch (error) {
            billingSummary.classList.add('hidden');
            billingMessage.style.color = 'red';
            billingMessage.textContent = 'Unable to connect to the backend server.';
        }
    });
}

generateReceiptButton.addEventListener('click', async () => {
    const appointmentNumber = document.getElementById('billingAppointmentNumber').value.trim();

    if (!appointmentNumber) {
        billingMessage.style.color = 'red';
        billingMessage.textContent = 'Please enter an appointment number to generate a receipt.';
        return;
    }

    try {
        const response = await apiRequest(`/api/bills/${appointmentNumber}/receipt`);
        const result = await response.json();

        if (response.ok) {
            billingMessage.style.color = 'green';
            billingMessage.textContent = 'Receipt generated successfully.';
            document.getElementById('billReceiptNumber').textContent = result.receiptNumber;
            billingSummary.classList.remove('hidden');
        } else {
            billingMessage.style.color = 'red';
            billingMessage.textContent = result.message || 'Invalid appointment number.';
        }
    } catch (error) {
        billingMessage.style.color = 'red';
        billingMessage.textContent = 'Unable to connect to the backend server.';
    }
});

printReceiptButton.addEventListener('click', () => {
    const billingText = document.getElementById('billingSummary').innerText;
    if (billingText.trim() === '' || billingSummary.classList.contains('hidden')) {
        billingMessage.style.color = 'red';
        billingMessage.textContent = 'Generate a bill before printing the receipt.';
        return;
    }

    const printWindow = window.open('', '', 'width=650,height=700');
    printWindow.document.write('<html><head><title>Receipt</title></head><body>' +
        '<h2>Sunrise Dental Clinic</h2>' +
        '<pre>' + billingText + '</pre>' +
        '</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
});

document.getElementById('staffAppointmentForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
        appointmentNumber: document.getElementById('staffAppointmentNumber').value.trim(),
        patientName: document.getElementById('staffPatientName').value.trim(),
        address: document.getElementById('staffAddress').value.trim(),
        contactNumber: document.getElementById('staffContactNumber').value.trim(),
        dentistName: document.getElementById('staffDentistName').value.trim(),
        treatmentType: document.getElementById('staffTreatmentType').value,
        appointmentDate: document.getElementById('staffAppointmentDate').value,
        appointmentTime: document.getElementById('staffAppointmentTime').value
    };

    try {
        const response = await apiRequest('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (response.ok) {
            const messageEl = document.getElementById('staffAppointmentMessage');
            if (messageEl) {
                messageEl.style.color = 'green';
                messageEl.textContent = 'Appointment saved successfully for ' + result.patientName;
            }
            document.getElementById('staffAppointmentForm').reset();
            loadStaffDashboardMetrics();
        } else {
            const messageEl = document.getElementById('staffAppointmentMessage');
            if (messageEl) {
                messageEl.style.color = 'red';
                messageEl.textContent = result.message || 'Appointment could not be saved.';
            }
        }
    } catch (error) {
        const messageEl = document.getElementById('staffAppointmentMessage');
        if (messageEl) {
            messageEl.style.color = 'red';
            messageEl.textContent = 'Unable to connect to the backend server.';
        }
    }
});

document.getElementById('staffSearchForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const appointmentNumber = document.getElementById('staffSearchAppointmentNumber').value.trim();
    try {
        const response = await apiRequest(`/api/appointments/${appointmentNumber}`);
        const result = await response.json();

        if (response.ok) {
            const detailsBox = document.getElementById('staffAppointmentDetails');
            if (detailsBox) detailsBox.classList.remove('hidden');
            document.getElementById('staffDetailAppointmentNumber').textContent = result.appointmentNumber;
            document.getElementById('staffDetailPatientName').textContent = result.patientName;
            document.getElementById('staffDetailAddress').textContent = result.address;
            document.getElementById('staffDetailContactNumber').textContent = result.contactNumber;
            document.getElementById('staffDetailDentistName').textContent = result.dentistName;
            document.getElementById('staffDetailTreatmentType').textContent = result.treatmentType;
            document.getElementById('staffDetailAppointmentDate').textContent = result.appointmentDate;
            document.getElementById('staffDetailAppointmentTime').textContent = result.appointmentTime;
            document.getElementById('staffDetailStatus').textContent = getStatusForAppointment(result);
            document.getElementById('staffSearchMessage').style.color = 'green';
            document.getElementById('staffSearchMessage').textContent = 'Appointment found.';
        } else {
            document.getElementById('staffAppointmentDetails').classList.add('hidden');
            document.getElementById('staffSearchMessage').style.color = 'red';
            document.getElementById('staffSearchMessage').textContent = result.message || 'Appointment not found.';
        }
    } catch (error) {
        document.getElementById('staffAppointmentDetails').classList.add('hidden');
        document.getElementById('staffSearchMessage').style.color = 'red';
        document.getElementById('staffSearchMessage').textContent = 'Unable to connect to the backend server.';
    }
});

document.getElementById('staffPatientSearch')?.addEventListener('input', async (event) => {
    const query = event.target.value.trim().toLowerCase();
    try {
        const response = await apiRequest('/api/appointments');
        if (!response.ok) {
            throw new Error('Unable to load appointments');
        }

        const appointments = await response.json();
        const safeAppointments = Array.isArray(appointments) ? appointments : [];
        const filtered = safeAppointments.filter((item) => {
            if (!query) return true;
            const patientMatch = (item.patientName || '').toLowerCase().includes(query);
            const appointmentMatch = (item.appointmentNumber || '').toLowerCase().includes(query);
            return patientMatch || appointmentMatch;
        });

        const rows = filtered.slice(0, 10).map((item) => `
            <tr>
                <td>${item.patientName || '—'}</td>
                <td>${item.contactNumber || '—'}</td>
                <td>${item.dentistName || '—'}</td>
                <td>${item.treatmentType || '—'}</td>
                <td>${item.appointmentDate || '—'}</td>
                <td><button type="button" class="secondary-button" data-action="search-appointment">View History</button></td>
            </tr>
        `).join('');

        document.getElementById('staffPatientRecordsTableBody').innerHTML = rows || '<tr><td colspan="6">No patient records found.</td></tr>';
    } catch (error) {
        document.getElementById('staffPatientRecordsTableBody').innerHTML = '<tr><td colspan="6">Unable to load patient records.</td></tr>';
    }
});

document.getElementById('staffBillingForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const appointmentNumber = document.getElementById('staffBillingAppointmentNumber').value.trim();

    try {
        const response = await apiRequest(`/api/bills/${appointmentNumber}`);
        const result = await response.json();

        if (response.ok) {
            const summary = document.getElementById('staffBillingSummary');
            if (summary) summary.classList.remove('hidden');
            document.getElementById('staffBillAppointmentNumber').textContent = result.appointmentNumber;
            document.getElementById('staffBillPatientName').textContent = result.patientName;
            document.getElementById('staffBillDentistName').textContent = result.dentistName;
            document.getElementById('staffBillTreatmentType').textContent = result.treatmentType;
            document.getElementById('staffBillTreatmentCost').textContent = formatCurrency(result.treatmentCost);
            document.getElementById('staffBillConsultationFee').textContent = formatCurrency(result.consultationFee);
            document.getElementById('staffBillTotalAmount').textContent = formatCurrency(result.totalAmount);
            document.getElementById('staffBillPaymentStatus').textContent = result.paymentStatus || 'Pending';
            document.getElementById('staffBillingMessage').style.color = 'green';
            document.getElementById('staffBillingMessage').textContent = result.message || 'Bill generated successfully.';
        } else {
            document.getElementById('staffBillingSummary').classList.add('hidden');
            document.getElementById('staffBillingMessage').style.color = 'red';
            document.getElementById('staffBillingMessage').textContent = result.message || 'Invalid appointment number.';
        }
    } catch (error) {
        document.getElementById('staffBillingSummary').classList.add('hidden');
        document.getElementById('staffBillingMessage').style.color = 'red';
        document.getElementById('staffBillingMessage').textContent = 'Unable to connect to the backend server.';
    }
});

document.getElementById('staffGenerateReceiptButton')?.addEventListener('click', async () => {
    const appointmentNumber = document.getElementById('staffBillingAppointmentNumber').value.trim();
    try {
        const response = await apiRequest(`/api/bills/${appointmentNumber}/receipt`);
        const result = await response.json();
        if (response.ok) {
            document.getElementById('staffBillPaymentStatus').textContent = result.paymentStatus || 'Paid';
            document.getElementById('staffBillingMessage').style.color = 'green';
            document.getElementById('staffBillingMessage').textContent = 'Receipt generated successfully.';
        } else {
            document.getElementById('staffBillingMessage').style.color = 'red';
            document.getElementById('staffBillingMessage').textContent = result.message || 'Unable to generate receipt.';
        }
    } catch (error) {
        document.getElementById('staffBillingMessage').style.color = 'red';
        document.getElementById('staffBillingMessage').textContent = 'Unable to connect to the backend server.';
    }
});

document.getElementById('staffPrintReceiptButton')?.addEventListener('click', () => {
    const billingText = document.getElementById('staffBillingSummary').innerText;
    if (billingText.trim() === '' || document.getElementById('staffBillingSummary').classList.contains('hidden')) {
        document.getElementById('staffBillingMessage').style.color = 'red';
        document.getElementById('staffBillingMessage').textContent = 'Generate a bill before printing the receipt.';
        return;
    }

    const printWindow = window.open('', '', 'width=650,height=700');
    printWindow.document.write('<html><head><title>Receipt</title></head><body>' +
        '<h2>Sunrise Dental Clinic</h2>' +
        '<pre>' + billingText + '</pre>' +
        '</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
});

exitButton.addEventListener('click', () => {
    homePanel.classList.remove('hidden');
    loginPanel.classList.add('hidden');
    appointmentPanel.classList.add('hidden');
    appointmentForm.reset();
    searchForm.reset();
    billingForm.reset();
    appointmentDetails.classList.add('hidden');
    clearBillingSummary();
    document.getElementById('staffAppointmentForm')?.reset();
    document.getElementById('staffSearchForm')?.reset();
    document.getElementById('staffBillingForm')?.reset();
    document.getElementById('staffAppointmentDetails')?.classList.add('hidden');
    document.getElementById('staffBillingSummary')?.classList.add('hidden');
    loginMessage.textContent = 'You have safely exited the system.';
    loginMessage.style.color = 'green';
    appointmentMessage.textContent = '';
    searchMessage.textContent = '';
    billingMessage.textContent = '';
    const staffMessage = document.getElementById('staffAppointmentMessage');
    if (staffMessage) staffMessage.textContent = '';
    const staffSearchMessage = document.getElementById('staffSearchMessage');
    if (staffSearchMessage) staffSearchMessage.textContent = '';
    const staffBillingMessage = document.getElementById('staffBillingMessage');
    if (staffBillingMessage) staffBillingMessage.textContent = '';
});

// Update Appointment Form Submission
document.getElementById('updateAppointmentSubmitButton')?.addEventListener('click', async () => {
    const appointmentNumber = document.getElementById('updateAppointmentNumber').value.trim();
    const patientName = document.getElementById('updatePatientName').value.trim();
    const address = document.getElementById('updateAddress').value.trim();
    const contactNumber = document.getElementById('updateContactNumber').value.trim();
    const dentistName = document.getElementById('updateDentistName').value.trim();
    const treatmentType = document.getElementById('updateTreatmentType').value.trim();
    const appointmentDate = document.getElementById('updateAppointmentDate').value.trim();
    const appointmentTime = document.getElementById('updateAppointmentTime').value.trim();
    const status = document.getElementById('updateStatus').value.trim();
    const messageEl = document.getElementById('updateAppointmentMessage');

    if (!appointmentNumber || !patientName || !address || !contactNumber || !dentistName || !treatmentType || !appointmentDate || !appointmentTime) {
        if (messageEl) {
            messageEl.textContent = 'All fields are required.';
            messageEl.style.color = '#d9534f';
        }
        return;
    }

    try {
        const response = await apiRequest(`/api/appointments/${encodeURIComponent(appointmentNumber)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patientName,
                address,
                contactNumber,
                dentistName,
                treatmentType,
                appointmentDate,
                appointmentTime,
                status
            })
        });

        if (!response.ok) {
            throw new Error('Unable to update appointment');
        }

        if (messageEl) {
            messageEl.textContent = 'Appointment updated successfully!';
            messageEl.style.color = 'green';
        }

        setTimeout(() => {
            const modal = document.getElementById('updateAppointmentModal');
            if (modal) {
                modal.classList.add('hidden');
            }
            loadManageAppointmentsTable();
        }, 1500);
    } catch (error) {
        if (messageEl) {
            messageEl.textContent = 'Error updating appointment: ' + error.message;
            messageEl.style.color = '#d9534f';
        }
    }
});

// Modal Close Handlers
document.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', () => {
        const modalId = button.getAttribute('data-modal-close');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    });
});

// Close modal when clicking outside the modal-content
document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
