/**
 * School Management System
 * Authentication Module
 */

// When DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        // If already logged in, redirect to appropriate dashboard
        // redirectToDashboard(currentUser.type);
    }

    // Setup login form event listeners
    setupLoginForm();
    
    // Setup password toggle
    setupPasswordToggle();
    
    // Setup forgot password link
    setupForgotPassword();
});


/**
 * Setup login form validation and submission
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Hide previous error
            if (loginError) {
                loginError.classList.add('d-none');
            }
            
            // Validate form
            if (!loginForm.checkValidity()) {
                loginForm.classList.add('was-validated');
                return;
            }
            
            // Get form data
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const userType = document.getElementById('user-type').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Authenticate user
            const authResult = authenticateUser(username, password, userType);
            
            if (authResult.success) {
                // Save user session
                saveUserSession(authResult.user, rememberMe);
                
                // Redirect to appropriate dashboard
                redirectToDashboard(userType);
            } else {
                // Show error message
                if (loginError) {
                    loginError.textContent = authResult.message;
                    loginError.classList.remove('d-none');
                }
            }
        });
    }
}

/**
 * Authenticate user against predefined credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {string} userType - User type (admin/teacher)
 * @returns {object} Auth result with success status, message, and user data if successful
 */
function authenticateUser(username, password, userType) {
    // Get users from storage or create default ones if none exist
    let users = getUsers();
    
    // Check if we have the user
    const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.type === userType
    );
    
    if (user) {
        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                type: user.type
            }
        };
    } else {
        return {
            success: false,
            message: 'Invalid username or password. Please try again.'
        };
    }
}

/**
 * Get users from localStorage or create default ones if none exist
 * @returns {Array} Array of user objects
 */
function getUsers() {
    // Try to get users from localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }
    
    // If no users exist, create default ones
    const defaultUsers = [
        {
            id: 'admin1',
            username: 'admin',
            password: 'admin123',
            name: 'Admin User',
            type: 'admin'
        },
        {
            id: 'teacher1',
            username: 'teacher1',
            password: 'teacher123',
            name: 'John Smith',
            type: 'teacher',
            subjects: ['Mathematics', 'Physics'],
            assignedClasses: ['X-A', 'X-B', 'XI-A']
        },
        {
            id: 'teacher2',
            username: 'teacher2',
            password: 'teacher123',
            name: 'Emily Johnson',
            type: 'teacher',
            subjects: ['English', 'History'],
            assignedClasses: ['IX-A', 'IX-B', 'X-A']
        }
    ];
    
    // Save default users to localStorage
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    
    return defaultUsers;
}

/**
 * Save user session to localStorage
 * @param {object} user - User object
 * @param {boolean} rememberMe - Whether to remember the user
 */
function saveUserSession(user, rememberMe) {
    // Create session object
    const session = {
        user: user,
        expires: rememberMe ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
    
    // Save to localStorage
    localStorage.setItem('currentSession', JSON.stringify(session));
}

/**
 * Get current logged in user
 * @returns {object|null} Current user or null if not logged in
 */
function getCurrentUser() {
    // Get session from localStorage
    const sessionJson = localStorage.getItem('currentSession');
    if (!sessionJson) return null;
    
    const session = JSON.parse(sessionJson);
    
    // Check if session has expired
    if (session.expires) {
        const expiryDate = new Date(session.expires);
        if (expiryDate < new Date()) {
            // Session has expired, clear it
            localStorage.removeItem('currentSession');
            return null;
        }
    }
    
    return session.user;
}

/**
 * Logout current user
 */
function logout() {
    // Remove user session
    localStorage.removeItem('currentSession');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

/**
 * Redirect to appropriate dashboard based on user type
 * @param {string} userType - User type (admin/teacher)
 */
function redirectToDashboard(userType) {
    if (userType === 'admin') {
        window.location.href = 'index.html';
    } else if (userType === 'teacher') {
        window.location.href = 'teacher.html';
    } else {
        console.error('Unknown user type');
    }
}

/**
 * Setup password toggle visibility
 */
function setupPasswordToggle() {
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            // Toggle password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
}

/**
 * Setup forgot password link
 */
function setupForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgot-password');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show alert with instructions
            showAlert('Please contact the school administrator to reset your password.', 'info');
        });
    }
}