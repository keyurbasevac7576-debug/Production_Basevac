// BaseVac Dental Production Reporting System JavaScript

// Configuration and Data
const APP_CONFIG = {
    company: {
        name: "BaseVac Dental",
        tagline: "Professional Dental Solutions"
    },
    defaultTeamMembers: ["Mohsin", "Kaiser", "Mike"],
    defaultTasks: [
        "Assemble & Solder Copper Components (INL04AA, INL04BB, DIS04-2)",
        "AWS Tank Preparation",
        "Attach Covers to Systems",
        "Box Systems for Shipping",
        "Connect Panel to Pump Systems",
        "Cut Brackets for Exhaust",
        "Cut Copper Pipes (Inlets & Exhaust)",
        "Cut Foams for Sides & Tops",
        "Inspect Pumps (12 units)",
        "Kit Assembly & Next Week Preparation",
        "Make Side Covers",
        "Make Top Covers",
        "Mount Inlet & Exhaust Systems",
        "Mount Pumps in Frames",
        "Prepare Frames & Mount Control Panels",
        "Prepare Parts for Installation",
        "Sandblast & Paint Components",
        "System Testing (12 units - Parallel Testing)",
        "Test Pumps (12 units - Parallel Testing)",
        "Other (Specify in comments)"
    ],
    defaultStandardTimes: {
        "Assemble & Solder Copper Components (INL04AA, INL04BB, DIS04-2)": 17.67,
        "Cut Copper Pipes (Inlets & Exhaust)": 4,
        "Inspect Pumps (12 units)": 20,
        "Sandblast & Paint Components": 4.75,
        "Connect Panel to Pump Systems": 5,
        "Prepare Frames & Mount Control Panels": 5,
        "Prepare Parts for Installation": 5,
        "Test Pumps (12 units - Parallel Testing)": 6
    },
    adminCredentials: {
        username: "admin",
        password: "basevac2025"
    }
};

// Global state
let isAuthenticated = false;
let currentUser = null;
let sessionTimeout = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
        setupEventListeners();
        checkAuthStatus();
        showDailyReport();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Initialize application data
function initializeApp() {
    // Initialize localStorage with default data if not exists
    if (!localStorage.getItem('bv_team_members')) {
        localStorage.setItem('bv_team_members', JSON.stringify(APP_CONFIG.defaultTeamMembers));
    }
    if (!localStorage.getItem('bv_tasks')) {
        localStorage.setItem('bv_tasks', JSON.stringify(APP_CONFIG.defaultTasks));
    }
    if (!localStorage.getItem('bv_standard_times')) {
        localStorage.setItem('bv_standard_times', JSON.stringify(APP_CONFIG.defaultStandardTimes));
    }
    if (!localStorage.getItem('bv_reports')) {
        localStorage.setItem('bv_reports', JSON.stringify([]));
    }

    // Set today's date as default
    const dateInput = document.getElementById('report-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Populate form data after a short delay to ensure DOM is ready
    setTimeout(() => {
        populateFormData();
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    const dailyReportForm = document.getElementById('daily-report-form');
    const loginForm = document.getElementById('login-form');
    
    if (dailyReportForm) {
        dailyReportForm.addEventListener('submit', handleDailyReportSubmit);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when clicking nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });

    // Auto-logout timer
    resetSessionTimer();
    document.addEventListener('click', resetSessionTimer);
    document.addEventListener('keypress', resetSessionTimer);
    
    // Modal close handlers
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeConfirmationModal();
            }
        });
    }
}

// Authentication functions
function checkAuthStatus() {
    try {
        const authStatus = localStorage.getItem('bv_auth_status');
        const authTime = localStorage.getItem('bv_auth_time');
        
        if (authStatus === 'authenticated' && authTime) {
            const timeDiff = Date.now() - parseInt(authTime);
            // Session expires after 2 hours
            if (timeDiff < 2 * 60 * 60 * 1000) {
                isAuthenticated = true;
                updateAuthUI();
            } else {
                logout();
            }
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === APP_CONFIG.adminCredentials.username && 
        password === APP_CONFIG.adminCredentials.password) {
        
        isAuthenticated = true;
        currentUser = username;
        
        localStorage.setItem('bv_auth_status', 'authenticated');
        localStorage.setItem('bv_auth_time', Date.now().toString());
        
        updateAuthUI();
        showAdminPanel();
        showToast('Login successful!', 'success');
        
        // Clear form
        document.getElementById('login-form').reset();
        
    } else {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
            errorEl.textContent = 'Invalid username or password';
            errorEl.classList.remove('hidden');
            setTimeout(() => errorEl.classList.add('hidden'), 3000);
        }
    }
}

function logout() {
    isAuthenticated = false;
    currentUser = null;
    
    localStorage.removeItem('bv_auth_status');
    localStorage.removeItem('bv_auth_time');
    
    updateAuthUI();
    showDailyReport();
    showToast('Logged out successfully', 'info');
    
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
    }
}

function updateAuthUI() {
    const adminBtn = document.getElementById('admin-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (adminBtn && logoutBtn) {
        if (isAuthenticated) {
            adminBtn.textContent = 'Admin Panel';
            logoutBtn.classList.remove('hidden');
        } else {
            adminBtn.textContent = 'Admin';
            logoutBtn.classList.add('hidden');
        }
    }
}

function resetSessionTimer() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
    }
    
    if (isAuthenticated) {
        // Auto logout after 30 minutes of inactivity
        sessionTimeout = setTimeout(() => {
            logout();
            showToast('Session expired due to inactivity', 'warning');
        }, 30 * 60 * 1000);
    }
}

// Navigation functions
function showSection(sectionId) {
    try {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error showing section:', error);
    }
}

function showDailyReport() {
    showSection('daily-report-section');
    populateFormData();
}

function showDashboard() {
    showSection('dashboard-section');
    updateDashboard();
}

function showAdminLogin() {
    if (isAuthenticated) {
        showAdminPanel();
    } else {
        showSection('admin-login-section');
    }
}

function showAdminPanel() {
    if (!isAuthenticated) {
        showAdminLogin();
        return;
    }
    
    showSection('admin-panel-section');
    populateAdminPanel();
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu && toggle) {
        navMenu.classList.toggle('active');
        toggle.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu && toggle) {
        navMenu.classList.remove('active');
        toggle.classList.remove('active');
    }
}

// Data management functions
function getTeamMembers() {
    try {
        return JSON.parse(localStorage.getItem('bv_team_members') || '[]');
    } catch (error) {
        console.error('Error getting team members:', error);
        return APP_CONFIG.defaultTeamMembers;
    }
}

function getTasks() {
    try {
        return JSON.parse(localStorage.getItem('bv_tasks') || '[]');
    } catch (error) {
        console.error('Error getting tasks:', error);
        return APP_CONFIG.defaultTasks;
    }
}

function getStandardTimes() {
    try {
        return JSON.parse(localStorage.getItem('bv_standard_times') || '{}');
    } catch (error) {
        console.error('Error getting standard times:', error);
        return APP_CONFIG.defaultStandardTimes;
    }
}

function getReports() {
    try {
        return JSON.parse(localStorage.getItem('bv_reports') || '[]');
    } catch (error) {
        console.error('Error getting reports:', error);
        return [];
    }
}

function saveReports(reports) {
    try {
        localStorage.setItem('bv_reports', JSON.stringify(reports));
    } catch (error) {
        console.error('Error saving reports:', error);
    }
}

function populateFormData() {
    try {
        // Populate team members dropdown
        const teamMemberSelect = document.getElementById('team-member');
        if (teamMemberSelect) {
            teamMemberSelect.innerHTML = '<option value="">Select team member</option>';
            
            getTeamMembers().forEach(member => {
                const option = document.createElement('option');
                option.value = member;
                option.textContent = member;
                teamMemberSelect.appendChild(option);
            });
        }
        
        // Populate tasks dropdown
        const taskSelect = document.getElementById('task-select');
        if (taskSelect) {
            taskSelect.innerHTML = '<option value="">Select a task</option>';
            
            getTasks().forEach(task => {
                const option = document.createElement('option');
                option.value = task;
                option.textContent = task;
                taskSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error populating form data:', error);
    }
}

// Report submission
function handleDailyReportSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = {
            date: document.getElementById('report-date').value,
            teamMember: document.getElementById('team-member').value,
            task: document.getElementById('task-select').value,
            timeSpent: parseFloat(document.getElementById('time-spent').value),
            unitsCompleted: parseInt(document.getElementById('units-completed').value),
            comments: document.getElementById('comments').value,
            timestamp: new Date().toISOString()
        };
        
        // Calculate efficiency if standard time exists
        const standardTimes = getStandardTimes();
        if (standardTimes[formData.task]) {
            const expectedTime = (standardTimes[formData.task] * formData.unitsCompleted) / 12;
            formData.efficiency = ((expectedTime / formData.timeSpent) * 100).toFixed(1);
        }
        
        // Save report
        const reports = getReports();
        reports.push(formData);
        saveReports(reports);
        
        showToast('Report submitted successfully!', 'success');
        document.getElementById('daily-report-form').reset();
        
        const dateInput = document.getElementById('report-date');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
        
        // Update dashboard if visible
        if (!document.getElementById('dashboard-section').classList.contains('hidden')) {
            updateDashboard();
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        showToast('Error submitting report', 'error');
    }
}

// Dashboard functions
function updateDashboard() {
    try {
        const reports = getReports();
        const today = new Date().toISOString().split('T')[0];
        const startOfWeek = getStartOfWeek(new Date());
        
        // Calculate metrics
        const todayReports = reports.filter(r => r.date === today);
        const weekReports = reports.filter(r => new Date(r.date) >= startOfWeek);
        
        let totalEfficiency = 0;
        let efficiencyCount = 0;
        
        reports.forEach(report => {
            if (report.efficiency) {
                totalEfficiency += parseFloat(report.efficiency);
                efficiencyCount++;
            }
        });
        
        const avgEfficiency = efficiencyCount > 0 ? 
            (totalEfficiency / efficiencyCount).toFixed(1) + '%' : '--';
        
        // Update metrics display
        const todayEl = document.getElementById('today-reports');
        const weekEl = document.getElementById('week-reports');
        const totalEl = document.getElementById('total-reports');
        const efficiencyEl = document.getElementById('avg-efficiency');
        
        if (todayEl) todayEl.textContent = todayReports.length;
        if (weekEl) weekEl.textContent = weekReports.length;
        if (totalEl) totalEl.textContent = reports.length;
        if (efficiencyEl) efficiencyEl.textContent = avgEfficiency;
        
        // Update tables
        updateRecentReportsTable(reports);
        updateTeamPerformanceTable(reports);
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

function updateRecentReportsTable(reports) {
    try {
        const tbody = document.getElementById('recent-reports-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Show last 10 reports
        const recentReports = reports.slice(-10).reverse();
        
        recentReports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(report.date).toLocaleDateString()}</td>
                <td>${report.teamMember}</td>
                <td>${report.task.length > 30 ? report.task.substring(0, 30) + '...' : report.task}</td>
                <td>${report.timeSpent}</td>
                <td>${report.unitsCompleted}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (recentReports.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" style="text-align: center; color: var(--color-text-secondary);">No reports yet</td>';
            tbody.appendChild(row);
        }
    } catch (error) {
        console.error('Error updating recent reports table:', error);
    }
}

function updateTeamPerformanceTable(reports) {
    try {
        const tbody = document.getElementById('team-performance-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const teamStats = {};
        
        reports.forEach(report => {
            if (!teamStats[report.teamMember]) {
                teamStats[report.teamMember] = {
                    reports: 0,
                    totalHours: 0,
                    totalEfficiency: 0,
                    efficiencyCount: 0
                };
            }
            
            const stats = teamStats[report.teamMember];
            stats.reports++;
            stats.totalHours += report.timeSpent;
            
            if (report.efficiency) {
                stats.totalEfficiency += parseFloat(report.efficiency);
                stats.efficiencyCount++;
            }
        });
        
        Object.keys(teamStats).forEach(member => {
            const stats = teamStats[member];
            const avgEfficiency = stats.efficiencyCount > 0 ? 
                (stats.totalEfficiency / stats.efficiencyCount).toFixed(1) + '%' : '--';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member}</td>
                <td>${stats.reports}</td>
                <td>${stats.totalHours.toFixed(1)}</td>
                <td>${avgEfficiency}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (Object.keys(teamStats).length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" style="text-align: center; color: var(--color-text-secondary);">No team data yet</td>';
            tbody.appendChild(row);
        }
    } catch (error) {
        console.error('Error updating team performance table:', error);
    }
}

function getStartOfWeek(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    return new Date(start.setDate(diff));
}

// Admin panel functions
function populateAdminPanel() {
    try {
        populateTeamMembersList();
        populateTasksList();
        populateStandardTimesList();
        populateStandardTimeDropdown();
    } catch (error) {
        console.error('Error populating admin panel:', error);
    }
}

function populateTeamMembersList() {
    const list = document.getElementById('team-members-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    getTeamMembers().forEach(member => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.innerHTML = `
            <span>${member}</span>
            <button class="btn btn--outline" onclick="removeTeamMember('${member}')">Remove</button>
        `;
        list.appendChild(item);
    });
}

function populateTasksList() {
    const list = document.getElementById('tasks-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    getTasks().forEach(task => {
        const item = document.createElement('div');
        item.className = 'config-item';
        const escapedTask = task.replace(/'/g, '\\\'');
        item.innerHTML = `
            <span title="${task}">${task.length > 40 ? task.substring(0, 40) + '...' : task}</span>
            <button class="btn btn--outline" onclick="removeTask('${escapedTask}')">Remove</button>
        `;
        list.appendChild(item);
    });
}

function populateStandardTimesList() {
    const list = document.getElementById('standard-times-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const standardTimes = getStandardTimes();
    Object.keys(standardTimes).forEach(task => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.innerHTML = `
            <span title="${task}">${task.length > 30 ? task.substring(0, 30) + '...' : task}</span>
            <span>${standardTimes[task]} hrs</span>
        `;
        list.appendChild(item);
    });
}

function populateStandardTimeDropdown() {
    const select = document.getElementById('standard-time-task');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select task</option>';
    
    getTasks().forEach(task => {
        const option = document.createElement('option');
        option.value = task;
        option.textContent = task.length > 50 ? task.substring(0, 50) + '...' : task;
        select.appendChild(option);
    });
}

function addTeamMember() {
    try {
        const input = document.getElementById('new-team-member');
        const name = input.value.trim();
        
        if (!name) {
            showToast('Please enter a team member name', 'error');
            return;
        }
        
        const members = getTeamMembers();
        if (members.includes(name)) {
            showToast('Team member already exists', 'error');
            return;
        }
        
        members.push(name);
        localStorage.setItem('bv_team_members', JSON.stringify(members));
        
        input.value = '';
        populateTeamMembersList();
        populateFormData();
        showToast('Team member added successfully', 'success');
    } catch (error) {
        console.error('Error adding team member:', error);
        showToast('Error adding team member', 'error');
    }
}

function removeTeamMember(name) {
    showConfirmation(`Are you sure you want to remove "${name}"?`, () => {
        try {
            const members = getTeamMembers().filter(m => m !== name);
            localStorage.setItem('bv_team_members', JSON.stringify(members));
            populateTeamMembersList();
            populateFormData();
            showToast('Team member removed successfully', 'success');
        } catch (error) {
            console.error('Error removing team member:', error);
            showToast('Error removing team member', 'error');
        }
    });
}

function addTask() {
    try {
        const input = document.getElementById('new-task');
        const task = input.value.trim();
        
        if (!task) {
            showToast('Please enter a task name', 'error');
            return;
        }
        
        const tasks = getTasks();
        if (tasks.includes(task)) {
            showToast('Task already exists', 'error');
            return;
        }
        
        tasks.push(task);
        localStorage.setItem('bv_tasks', JSON.stringify(tasks));
        
        input.value = '';
        populateTasksList();
        populateFormData();
        populateStandardTimeDropdown();
        showToast('Task added successfully', 'success');
    } catch (error) {
        console.error('Error adding task:', error);
        showToast('Error adding task', 'error');
    }
}

function removeTask(task) {
    showConfirmation(`Are you sure you want to remove this task?`, () => {
        try {
            const tasks = getTasks().filter(t => t !== task);
            localStorage.setItem('bv_tasks', JSON.stringify(tasks));
            
            // Also remove from standard times
            const standardTimes = getStandardTimes();
            delete standardTimes[task];
            localStorage.setItem('bv_standard_times', JSON.stringify(standardTimes));
            
            populateTasksList();
            populateFormData();
            populateStandardTimesList();
            populateStandardTimeDropdown();
            showToast('Task removed successfully', 'success');
        } catch (error) {
            console.error('Error removing task:', error);
            showToast('Error removing task', 'error');
        }
    });
}

function setStandardTime() {
    try {
        const taskSelect = document.getElementById('standard-time-task');
        const hoursInput = document.getElementById('standard-time-hours');
        
        const task = taskSelect.value;
        const hours = parseFloat(hoursInput.value);
        
        if (!task || !hours || hours <= 0) {
            showToast('Please select a task and enter valid hours', 'error');
            return;
        }
        
        const standardTimes = getStandardTimes();
        standardTimes[task] = hours;
        localStorage.setItem('bv_standard_times', JSON.stringify(standardTimes));
        
        taskSelect.value = '';
        hoursInput.value = '';
        populateStandardTimesList();
        showToast('Standard time set successfully', 'success');
    } catch (error) {
        console.error('Error setting standard time:', error);
        showToast('Error setting standard time', 'error');
    }
}

function clearAllData() {
    showConfirmation('Are you sure you want to clear ALL data? This action cannot be undone!', () => {
        try {
            localStorage.removeItem('bv_reports');
            localStorage.setItem('bv_reports', JSON.stringify([]));
            showToast('All data cleared successfully', 'success');
            updateDashboard();
        } catch (error) {
            console.error('Error clearing data:', error);
            showToast('Error clearing data', 'error');
        }
    });
}

// Excel export function
function downloadExcelReport() {
    try {
        const reports = getReports();
        
        if (reports.length === 0) {
            showToast('No reports to export', 'warning');
            return;
        }
        
        // Check if XLSX is available
        if (typeof XLSX === 'undefined') {
            showToast('Excel export not available', 'error');
            return;
        }
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Prepare data for export
        const exportData = reports.map(report => ({
            Date: new Date(report.date).toLocaleDateString(),
            'Team Member': report.teamMember,
            Task: report.task,
            'Time Spent (hrs)': report.timeSpent,
            'Units Completed': report.unitsCompleted,
            'Efficiency (%)': report.efficiency || 'N/A',
            Comments: report.comments || '',
            Timestamp: new Date(report.timestamp).toLocaleString()
        }));
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Production Reports');
        
        // Generate filename with current date
        const filename = `BaseVac_Production_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Download file
        XLSX.writeFile(wb, filename);
        
        showToast('Excel report downloaded successfully', 'success');
    } catch (error) {
        console.error('Error downloading Excel report:', error);
        showToast('Error downloading report', 'error');
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    try {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Remove toast after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 4000);
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

// Confirmation modal
function showConfirmation(message, onConfirm) {
    try {
        const modal = document.getElementById('confirmation-modal');
        const messageEl = document.getElementById('confirmation-message');
        const confirmBtn = document.getElementById('confirm-action-btn');
        
        if (!modal || !messageEl || !confirmBtn) return;
        
        messageEl.textContent = message;
        modal.classList.remove('hidden');
        
        // Remove any existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.onclick = () => {
            closeConfirmationModal();
            onConfirm();
        };
    } catch (error) {
        console.error('Error showing confirmation:', error);
    }
}

function closeConfirmationModal() {
    try {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error closing confirmation modal:', error);
    }
}

// Global function exports
window.showDailyReport = showDailyReport;
window.showDashboard = showDashboard;
window.showAdminLogin = showAdminLogin;
window.showAdminPanel = showAdminPanel;
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;
window.addTeamMember = addTeamMember;
window.removeTeamMember = removeTeamMember;
window.addTask = addTask;
window.removeTask = removeTask;
window.setStandardTime = setStandardTime;
window.clearAllData = clearAllData;
window.downloadExcelReport = downloadExcelReport;
window.closeConfirmationModal = closeConfirmationModal;