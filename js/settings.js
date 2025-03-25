/**
 * School Management System
 * Settings Module Script
 */

/**
 * Initialize the settings page
 */
function initSettings() {
    console.log('Initializing settings page...');

    // Load users for user management tab
    loadUsers();

    // Setup event listeners for settings forms
    setupSettingsEventListeners();
}

/**
 * Setup event listeners for settings forms
 */
function setupSettingsEventListeners() {
    // School Information form
    const saveSchoolInfoBtn = document.getElementById('save-school-info-btn');
    if (saveSchoolInfoBtn) {
        saveSchoolInfoBtn.addEventListener('click', saveSchoolInfo);
    }

    // Academic Settings form
    const saveAcademicSettingsBtn = document.getElementById('save-academic-settings-btn');
    if (saveAcademicSettingsBtn) {
        saveAcademicSettingsBtn.addEventListener('click', saveAcademicSettings);
    }

    // Notification Settings form
    const saveNotificationSettingsBtn = document.getElementById('save-notification-settings-btn');
    if (saveNotificationSettingsBtn) {
        saveNotificationSettingsBtn.addEventListener('click', saveNotificationSettings);
    }

    // User Management
    const saveUserBtn = document.getElementById('save-user-btn');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', saveUser);
    }

    const updateUserBtn = document.getElementById('update-user-btn');
    if (updateUserBtn) {
        updateUserBtn.addEventListener('click', updateUser);
    }

    const confirmDeleteUserBtn = document.getElementById('confirm-delete-user-btn');
    if (confirmDeleteUserBtn) {
        confirmDeleteUserBtn.addEventListener('click', deleteUser);
    }
}

/**
 * Load users for the user management tab
 */
function loadUsers() {
    const usersTableBody = document.getElementById('users-table-body');
    if (!usersTableBody) return;

    // Get users from localStorage
    const users = getUsers();

    // Clear previous data
    usersTableBody.innerHTML = '';

    // Add user rows
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Generate a random last login date (for demo purposes)
        const lastLogin = new Date();
        lastLogin.setDate(lastLogin.getDate() - Math.floor(Math.random() * 14)); // Random day within last 2 weeks
        const formattedLastLogin = lastLogin.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Create email from username if it doesn't exist (for demo)
        const email = user.email || `${user.username}@school.edu`;

        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td><span class="badge bg-${user.type === 'admin' ? 'primary' : 'info'}">${user.type === 'admin' ? 'Administrator' : 'Teacher'}</span></td>
            <td>${email}</td>
            <td>${formattedLastLogin}</td>
            <td><span class="badge bg-success">Active</span></td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-primary me-1 edit-user-btn" data-user-id="${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger delete-user-btn" data-user-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });

    // Setup edit and delete buttons
    setupUserActionButtons();
}

/**
 * Setup user action buttons (edit and delete)
 */
function setupUserActionButtons() {
    // Edit user buttons
    const editUserBtns = document.querySelectorAll('.edit-user-btn');
    editUserBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            editUser(userId);
        });
    });

    // Delete user buttons
    const deleteUserBtns = document.querySelectorAll('.delete-user-btn');
    deleteUserBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            confirmDeleteUser(userId);
        });
    });
}

/**
 * Save school information
 */
function saveSchoolInfo() {
    // Get form values
    const schoolName = document.getElementById('school-name').value;
    const schoolCode = document.getElementById('school-code').value;
    const schoolAddress = document.getElementById('school-address').value;
    const schoolPhone = document.getElementById('school-phone').value;
    const schoolEmail = document.getElementById('school-email').value;
    const schoolPrincipal = document.getElementById('school-principal').value;
    const schoolEstablished = document.getElementById('school-established').value;
    const schoolWebsite = document.getElementById('school-website').value;

    // Create school info object
    const schoolInfo = {
        name: schoolName,
        code: schoolCode,
        address: schoolAddress,
        phone: schoolPhone,
        email: schoolEmail,
        principal: schoolPrincipal,
        established: schoolEstablished,
        website: schoolWebsite,
        updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('schoolInfo', JSON.stringify(schoolInfo));

    // Show success message
    showAlert('School information saved successfully', 'success');
}

/**
 * Save academic settings
 */
function saveAcademicSettings() {
    // Get form values
    const currentSession = document.getElementById('current-session').value;
    const sessionStartDate = document.getElementById('session-start-date').value;
    const workingDays = document.getElementById('working-days').value;
    const classDuration = document.getElementById('class-duration').value;
    const attendanceMethod = document.getElementById('attendance-method').value;
    const minAttendance = document.getElementById('min-attendance').value;

    // Get grade scale data
    const gradeScale = [];
    const gradeRows = document.querySelectorAll('#grade-table-body tr');
    gradeRows.forEach(row => {
        const grade = row.cells[0].querySelector('input').value;
        const minMarks = row.cells[1].querySelector('input').value;
        const maxMarks = row.cells[2].querySelector('input').value;
        const description = row.cells[3].querySelector('input').value;

        gradeScale.push({
            grade,
            minMarks,
            maxMarks,
            description
        });
    });

    // Create academic settings object
    const academicSettings = {
        currentSession,
        sessionStartDate,
        workingDays,
        classDuration,
        attendanceMethod,
        minAttendance,
        gradeScale,
        updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('academicSettings', JSON.stringify(academicSettings));

    // Show success message
    showAlert('Academic settings saved successfully', 'success');
}

/**
 * Save notification settings
 */
function saveNotificationSettings() {
    // Get form values
    const attendanceEmail = document.getElementById('attendance-email').checked;
    const examEmail = document.getElementById('exam-email').checked;
    const feeEmail = document.getElementById('fee-email').checked;
    const eventEmail = document.getElementById('event-email').checked;
    
    const attendanceSms = document.getElementById('attendance-sms').checked;
    const feeSms = document.getElementById('fee-sms').checked;
    const emergencySms = document.getElementById('emergency-sms').checked;
    const smsTemplate = document.getElementById('sms-template').value;

    // Create notification settings object
    const notificationSettings = {
        email: {
            attendance: attendanceEmail,
            exam: examEmail,
            fee: feeEmail,
            event: eventEmail
        },
        sms: {
            attendance: attendanceSms,
            fee: feeSms,
            emergency: emergencySms,
            template: smsTemplate
        },
        updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));

    // Show success message
    showAlert('Notification settings saved successfully', 'success');
}

/**
 * Save new user
 */
function saveUser() {
    // Get form values
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    // Validate required fields
    if (!name || !email || !username || !password || !role) {
        showAlert('Please fill all required fields', 'warning');
        return;
    }

    // Check if username already exists
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        showAlert('Username already exists. Please choose a different username.', 'warning');
        return;
    }

    // Get teacher-specific data if role is teacher
    let subjects = [];
    let assignedClasses = [];
    
    if (role === 'teacher') {
        const subjectsSelect = document.getElementById('teacher-subjects');
        const classesSelect = document.getElementById('teacher-classes');
        
        // Get selected options
        if (subjectsSelect) {
            Array.from(subjectsSelect.selectedOptions).forEach(option => {
                subjects.push(option.value);
            });
        }
        
        if (classesSelect) {
            Array.from(classesSelect.selectedOptions).forEach(option => {
                assignedClasses.push(option.value);
            });
        }
    }

    // Create new user object
    const newUser = {
        id: generateUniqueId(),
        name,
        email,
        username,
        password,
        type: role,
        createdAt: new Date().toISOString()
    };

    // Add teacher-specific data if role is teacher
    if (role === 'teacher') {
        newUser.subjects = subjects;
        newUser.assignedClasses = assignedClasses;
    }

    // Add to users array
    users.push(newUser);

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Reset form and close modal
    document.getElementById('add-user-form').reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    if (modal) {
        modal.hide();
    }

    // Reload users table
    loadUsers();

    // Show success message
    showAlert(`New ${role} user added successfully`, 'success');
}

/**
 * Edit user details
 * @param {string} userId - The user ID to edit
 */
function editUser(userId) {
    // Get user data
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showAlert('User not found', 'danger');
        return;
    }

    // Populate form fields
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-name').value = user.name;
    document.getElementById('edit-user-email').value = user.email || '';
    document.getElementById('edit-user-username').value = user.username;
    document.getElementById('edit-user-password').value = '';
    document.getElementById('edit-user-role').value = user.type;

    // Show/hide teacher fields based on role
    const teacherFields = document.getElementById('edit-teacher-info-fields');
    if (teacherFields) {
        teacherFields.style.display = user.type === 'teacher' ? 'block' : 'none';
    }

    // Populate teacher-specific fields if role is teacher
    if (user.type === 'teacher') {
        const subjectsSelect = document.getElementById('edit-teacher-subjects');
        const classesSelect = document.getElementById('edit-teacher-classes');
        
        // Clear previous selections
        Array.from(subjectsSelect.options).forEach(option => {
            option.selected = false;
        });
        
        Array.from(classesSelect.options).forEach(option => {
            option.selected = false;
        });
        
        // Select user's subjects
        if (user.subjects && subjectsSelect) {
            user.subjects.forEach(subject => {
                const option = Array.from(subjectsSelect.options).find(opt => opt.value === subject);
                if (option) {
                    option.selected = true;
                }
            });
        }
        
        // Select user's classes
        if (user.assignedClasses && classesSelect) {
            user.assignedClasses.forEach(className => {
                const option = Array.from(classesSelect.options).find(opt => opt.value === className);
                if (option) {
                    option.selected = true;
                }
            });
        }
    }

    // Show edit modal
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

/**
 * Update user details
 */
function updateUser() {
    // Get form values
    const userId = document.getElementById('edit-user-id').value;
    const name = document.getElementById('edit-user-name').value;
    const email = document.getElementById('edit-user-email').value;
    const username = document.getElementById('edit-user-username').value;
    const password = document.getElementById('edit-user-password').value;
    const role = document.getElementById('edit-user-role').value;

    // Validate required fields
    if (!name || !email || !username || !role) {
        showAlert('Please fill all required fields', 'warning');
        return;
    }

    // Get users from localStorage
    const users = getUsers();
    
    // Find the user to update
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        showAlert('User not found', 'danger');
        return;
    }

    // Check if username is taken by another user
    if (users.some(u => u.username === username && u.id !== userId)) {
        showAlert('Username already exists. Please choose a different username.', 'warning');
        return;
    }

    // Get teacher-specific data if role is teacher
    let subjects = [];
    let assignedClasses = [];
    
    if (role === 'teacher') {
        const subjectsSelect = document.getElementById('edit-teacher-subjects');
        const classesSelect = document.getElementById('edit-teacher-classes');
        
        // Get selected options
        if (subjectsSelect) {
            Array.from(subjectsSelect.selectedOptions).forEach(option => {
                subjects.push(option.value);
            });
        }
        
        if (classesSelect) {
            Array.from(classesSelect.selectedOptions).forEach(option => {
                assignedClasses.push(option.value);
            });
        }
    }

    // Create updated user object
    const updatedUser = {
        ...users[userIndex],
        name,
        email,
        username,
        type: role,
        updatedAt: new Date().toISOString()
    };

    // Update password if provided
    if (password) {
        updatedUser.password = password;
    }

    // Update teacher-specific data if role is teacher
    if (role === 'teacher') {
        updatedUser.subjects = subjects;
        updatedUser.assignedClasses = assignedClasses;
    } else {
        // Remove teacher-specific properties if role is not teacher
        delete updatedUser.subjects;
        delete updatedUser.assignedClasses;
    }

    // Update users array
    users[userIndex] = updatedUser;

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    if (modal) {
        modal.hide();
    }

    // Reload users table
    loadUsers();

    // Show success message
    showAlert('User updated successfully', 'success');
}

/**
 * Confirm delete user
 * @param {string} userId - The user ID to delete
 */
function confirmDeleteUser(userId) {
    // Get user data
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showAlert('User not found', 'danger');
        return;
    }

    // Set user name in confirmation dialog
    document.getElementById('delete-user-name').textContent = user.name;
    
    // Set user ID to delete button
    document.getElementById('confirm-delete-user-btn').setAttribute('data-user-id', userId);

    // Show confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    modal.show();
}

/**
 * Delete user
 */
function deleteUser() {
    // Get user ID from button
    const userId = document.getElementById('confirm-delete-user-btn').getAttribute('data-user-id');
    
    // Get users from localStorage
    const users = getUsers();
    
    // Remove user from array
    const updatedUsers = users.filter(u => u.id !== userId);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
    if (modal) {
        modal.hide();
    }

    // Reload users table
    loadUsers();

    // Show success message
    showAlert('User deleted successfully', 'success');
}