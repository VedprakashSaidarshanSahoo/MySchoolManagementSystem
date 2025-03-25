/**
 * School Management System
 * Main Application Script
 */

// When DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Redirect to login if not logged in
        // window.location.href = 'login.html';
        return;
    } else if (currentUser.type === 'teacher') {
        // Redirect to teacher portal
        window.location.href = 'teacher.html';
        return;
    }

    // Initialize the application
    initApp();
});

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing School Management System...');
    
    // Set admin name
    setAdminInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load default page (dashboard)
    loadPage('dashboard');
}

/**
 * Set admin information in the sidebar
 */
function setAdminInfo() {
    const currentUser = getCurrentUser();
    const adminNameElement = document.getElementById('admin-name');
    
    if (adminNameElement && currentUser) {
        adminNameElement.textContent = currentUser.name;
    }
}

/**
 * Setup all global event listeners
 */
function setupEventListeners() {
    // Menu items
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    
    menuItems.forEach(item => {
        // Skip logout button
        if (item.id === 'logout-button') return;
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get page to load
            const pageName = item.dataset.page;
            if (!pageName) return;
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            // Load page
            loadPage(pageName);
            
            // Close sidebar on mobile after selection
            if (window.innerWidth < 768) {
                document.getElementById('sidebar').classList.remove('show');
            }
        });
    });
    
    // Logout buttons
    const logoutButtons = document.querySelectorAll('#logout-button, #header-logout');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }
    
    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('show');
        });
    }
}

/**
 * Load a page into the main content area
 * @param {string} pageName - The name of the page to load
 */
function loadPage(pageName) {
    const pageContent = document.getElementById('page-content');
    const headerTitle = document.querySelector('.header-title h4');
    
    if (!pageContent) return;
    
    // Set header title based on the page
    if (headerTitle) {
        headerTitle.textContent = getPageTitle(pageName);
    }
    
    // Show loading state
    pageContent.innerHTML = `
        <div class="loader-container">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Get the page URL
    const pageUrl = getPageUrl(pageName);
    
    // Load the page content
    fetch(pageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load page: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            // Update page content
            pageContent.innerHTML = html;
            
            // Initialize page-specific scripts
            initPageScripts(pageName);
        })
        .catch(error => {
            console.error('Error loading page:', error);
            
            // Show error message
            pageContent.innerHTML = `
                <div class="alert alert-danger m-3">
                    <h4 class="alert-heading">Error Loading Page</h4>
                    <p>Sorry, there was an error loading the requested page.</p>
                    <hr>
                    <p class="mb-0">${error.message}</p>
                </div>
            `;
        });
}

/**
 * Get URL for a specific page
 * @param {string} pageName - Name of the page
 * @returns {string} - URL of the page
 */
function getPageUrl(pageName) {
    switch (pageName) {
        case 'dashboard':
            return 'pages/dashboard.html';
        case 'admission-single':
            return 'pages/admission-single.html';
        case 'admission-bulk':
            return 'pages/admission-bulk.html';
        case 'student-management':
            return 'pages/student-management.html';
        case 'class-management':
            return 'pages/class-management.html';
        case 'teacher-management':
            return 'pages/teacher-management.html';
        case 'attendance':
            return 'pages/attendance.html';
        case 'print-forms':
            return 'pages/print-forms.html';
        case 'settings':
            return 'pages/settings.html';
        default:
            return 'pages/dashboard.html';
    }
}

/**
 * Get title for a specific page
 * @param {string} pageName - Name of the page
 * @returns {string} - Title of the page
 */
function getPageTitle(pageName) {
    switch (pageName) {
        case 'dashboard':
            return 'Dashboard';
        case 'admission-single':
            return 'Single Admission';
        case 'admission-bulk':
            return 'Bulk Admission';
        case 'student-management':
            return 'Student Management';
        case 'class-management':
            return 'Class Management';
        case 'teacher-management':
            return 'Teacher Management';
        case 'attendance':
            return 'Attendance';
        case 'print-forms':
            return 'Print Forms';
        case 'settings':
            return 'Settings';
        default:
            return 'Dashboard';
    }
}

/**
 * Initialize page-specific scripts based on the loaded page
 * @param {string} pageName - The name of the loaded page
 */
function initPageScripts(pageName) {
    console.log(`Initializing scripts for page: ${pageName}`);
    
    // Run page-specific initialization functions
    switch (pageName) {
        case 'dashboard':
            if (typeof initDashboard === 'function') {
                initDashboard();
            }
            break;
        case 'admission-single':
            if (typeof initSingleAdmission === 'function') {
                initSingleAdmission();
            }
            break;
        case 'admission-bulk':
            if (typeof initBulkAdmission === 'function') {
                initBulkAdmission();
            }
            break;
        case 'student-management':
            if (typeof initStudentManagement === 'function') {
                initStudentManagement();
            }
            break;
        case 'print-forms':
            if (typeof initPrintForms === 'function') {
                initPrintForms();
            }
            break;
        case 'class-management':
            if (typeof initClassManagement === 'function') {
                initClassManagement();
            }
            break;
        case 'teacher-management':
            if (typeof initTeacherManagement === 'function') {
                initTeacherManagement();
            }
            break;
        case 'attendance':
            if (typeof initAttendanceManagement === 'function') {
                initAttendanceManagement();
            }
            break;
        // Add other page initializations as needed
    }
}