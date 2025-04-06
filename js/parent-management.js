/**
 * School Management System
 * Teacher Management Module
 */

/**
 * Initialize the teacher management page
 */
function initTeacherManagement() {
    console.log('Initializing teacher management...');
    
    // Setup event listeners
    setupTeacherManagementEvents();
    
    // Load teacher data
    loadTeachers();
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltips.length > 0) {
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }
}

/**
 * Setup event listeners for teacher management
 */
function setupTeacherManagementEvents() {
    // Filter events
    const applyFilterBtn = document.getElementById('apply-teacher-filter');
    const resetFilterBtn = document.getElementById('reset-teacher-filter');
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterTeachers);
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            // Reset filter inputs
            const nameFilter = document.getElementById('filter-teacher-name');
            const subjectFilter = document.getElementById('filter-subject');
            
            if (nameFilter) nameFilter.value = '';
            if (subjectFilter) subjectFilter.value = '';
            
            // Reload all teachers
            loadTeachers();
        });
    }
    
    // Save teacher button event
    const saveTeacherBtn = document.getElementById('save-teacher-btn');
    if (saveTeacherBtn) {
        saveTeacherBtn.addEventListener('click', saveTeacher);
    }
    
    // Password toggle in add teacher modal
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('teacher-password');
    
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Setup event delegation for action buttons
    document.addEventListener('click', (e) => {
        // View teacher details
        if (e.target.closest('.btn-info')) {
            const btn = e.target.closest('.btn-info');
            const row = btn.closest('tr');
            const teacherId = row.cells[0].textContent;
            
            viewTeacherDetails(teacherId);
        }
        
        // Edit teacher
        if (e.target.closest('.btn-warning')) {
            const btn = e.target.closest('.btn-warning');
            const row = btn.closest('tr');
            const teacherId = row.cells[0].textContent;
            
            editTeacher(teacherId);
        }
        
        // Delete teacher
        if (e.target.closest('.btn-danger')) {
            const btn = e.target.closest('.btn-danger');
            const row = btn.closest('tr');
            const teacherId = row.cells[0].textContent;
            
            deleteTeacher(teacherId);
        }
    });
}

/**
 * Load teachers from storage
 */
function loadTeachers() {
    // Get teachers from users data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teachers = users.filter(user => user.type === 'teacher');
    
    // Update table
    displayTeachers(teachers);
    
    // Update charts
    updateTeacherCharts(teachers);
}

/**
 * Display teachers in the table
 * @param {Array} teachers - Array of teacher objects
 */
function displayTeachers(teachers) {
    const tableBody = document.getElementById('teacher-table-body');
    if (!tableBody) return;
    
    // Clear previous data
    tableBody.innerHTML = '';
    
    if (teachers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No teachers found.</td>
            </tr>
        `;
        return;
    }
    
    // Add teacher rows
    teachers.forEach(teacher => {
        // Create status badge
        const statusBadge = teacher.status === 'active' || !teacher.status
            ? '<span class="badge bg-success">Active</span>' 
            : teacher.status === 'on-leave'
            ? '<span class="badge bg-warning">On Leave</span>'
            : '<span class="badge bg-secondary">Inactive</span>';
        
        // Format subjects
        const subjects = teacher.subjects ? teacher.subjects.join(', ') : '-';
        
        // Format assigned classes
        const assignedClasses = teacher.assignedClasses ? teacher.assignedClasses.join(', ') : '-';
        
        // Format contact information
        const contact = teacher.email || (teacher.contact ? teacher.contact.email : '-');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${subjects}</td>
            <td>${assignedClasses}</td>
            <td>${contact}</td>
            <td>${statusBadge}</td>
            <td>
                <button type="button" class="btn btn-sm btn-info me-1" data-bs-toggle="tooltip" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-sm btn-warning me-1" data-bs-toggle="tooltip" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="tooltip" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Reinitialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltips.length > 0) {
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }
}

/**
 * Update subject distribution and class assignment charts
 * @param {Array} teachers - Array of teacher objects
 */
function updateTeacherCharts(teachers) {
    // Count subjects
    const allSubjects = [];
    teachers.forEach(teacher => {
        if (teacher.subjects) {
            allSubjects.push(...teacher.subjects);
        }
    });
    
    // Count occurrence of each subject
    const subjectCounts = {};
    allSubjects.forEach(subject => {
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    
    // Format data for chart
    const subjectData = Object.keys(subjectCounts).map(subject => ({
        name: subject,
        count: subjectCounts[subject]
    }));
    
    // Format class assignment data
    const teacherClassData = teachers.map(teacher => ({
        name: teacher.name,
        count: teacher.assignedClasses ? teacher.assignedClasses.length : 0
    }));
    
    // Update charts
    updateSubjectDistributionChart(subjectData);
    updateClassAssignmentChart(teacherClassData);
}

/**
 * Update the subject distribution chart
 * @param {Array} data - Array of {name, count} objects
 */
function updateSubjectDistributionChart(data) {
    // Find existing Chart.js instance and destroy it
    const chartCanvas = document.getElementById('subjectDistributionChart');
    if (chartCanvas) {
        const chartInstance = Chart.getChart(chartCanvas);
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // Create new chart
        new Chart(chartCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    label: 'Teachers per Subject',
                    data: data.map(item => item.count),
                    backgroundColor: [
                        'rgba(78, 115, 223, 0.8)',
                        'rgba(28, 200, 138, 0.8)',
                        'rgba(54, 185, 204, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(231, 74, 59, 0.8)',
                        'rgba(133, 135, 150, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Teachers per Subject'
                    }
                }
            }
        });
    }
}

/**
 * Update the class assignment chart
 * @param {Array} data - Array of {name, count} objects
 */
function updateClassAssignmentChart(data) {
    // Find existing Chart.js instance and destroy it
    const chartCanvas = document.getElementById('classAssignmentChart');
    if (chartCanvas) {
        const chartInstance = Chart.getChart(chartCanvas);
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // Create new chart
        new Chart(chartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    label: 'Assigned Classes',
                    data: data.map(item => item.count),
                    backgroundColor: 'rgba(78, 115, 223, 0.8)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Classes'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Teachers'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Classes per Teacher'
                    }
                }
            }
        });
    }
}

/**
 * Filter teachers based on input
 */
function filterTeachers() {
    const nameFilter = document.getElementById('filter-teacher-name')?.value?.trim()?.toLowerCase() || '';
    const subjectFilter = document.getElementById('filter-subject')?.value || '';
    
    // Get all teachers
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teachers = users.filter(user => user.type === 'teacher');
    
    // Filter teachers
    const filteredTeachers = teachers.filter(teacher => {
        const nameMatch = !nameFilter || teacher.name.toLowerCase().includes(nameFilter);
        const subjectMatch = !subjectFilter || (teacher.subjects && teacher.subjects.includes(subjectFilter));
        
        return nameMatch && subjectMatch;
    });
    
    // Display filtered teachers
    displayTeachers(filteredTeachers);
}

/**
 * Save a new teacher
 */
function saveTeacher() {
    // Get form data
    const name = document.getElementById('teacher-name')?.value?.trim() || '';
    const teacherId = document.getElementById('teacher-id')?.value?.trim() || '';
    const email = document.getElementById('teacher-email')?.value?.trim() || '';
    const phone = document.getElementById('teacher-phone')?.value?.trim() || '';
    const gender = document.getElementById('teacher-gender')?.value || '';
    const dob = document.getElementById('teacher-dob')?.value || '';
    const joinDate = document.getElementById('teacher-join-date')?.value || '';
    const status = document.getElementById('teacher-status')?.value || 'active';
    const address = document.getElementById('teacher-address')?.value?.trim() || '';
    
    // Get username and password
    const username = document.getElementById('teacher-username')?.value?.trim() || '';
    const password = document.getElementById('teacher-password')?.value || '';
    
    // Validate required fields
    if (!name || !teacherId || !email || !phone || !username || !password) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    // Get selected subjects
    const subjectCheckboxes = document.querySelectorAll('#subject-checkboxes input[type="checkbox"]:checked');
    const subjects = [...subjectCheckboxes].map(cb => cb.value);
    
    // Get selected classes
    const classCheckboxes = document.querySelectorAll('#class-checkboxes input[type="checkbox"]:checked');
    const assignedClasses = [...classCheckboxes].map(cb => cb.value);
    
    // Check if teacher ID or username already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(user => user.id === teacherId)) {
        showAlert(`Teacher ID ${teacherId} already exists`, 'warning');
        return;
    }
    
    if (users.some(user => user.username === username)) {
        showAlert(`Username ${username} already exists`, 'warning');
        return;
    }
    
    // Create new teacher object
    const newTeacher = {
        id: teacherId,
        username,
        password,
        name,
        type: 'teacher',
        email,
        phone,
        gender,
        dateOfBirth: dob,
        joinDate,
        status,
        address,
        subjects,
        assignedClasses
    };
    
    // Add teacher to users
    users.push(newTeacher);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    showAlert(`Teacher ${name} added successfully`, 'success');
    
    // Reload teachers
    loadTeachers();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTeacherModal'));
    if (modal) {
        modal.hide();
    }
    
    // Reset form
    document.getElementById('add-teacher-form')?.reset();
}

/**
 * View teacher details
 * @param {string} teacherId - Teacher ID
 */
function viewTeacherDetails(teacherId) {
    // Get teacher data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacher = users.find(user => user.id === teacherId && user.type === 'teacher');
    
    if (!teacher) {
        showAlert(`Teacher with ID ${teacherId} not found`, 'danger');
        return;
    }
    
    // Set modal title
    document.getElementById('viewTeacherModalLabel').textContent = `Teacher Details: ${teacher.name}`;
    
    // Set basic info
    document.getElementById('detail-teacher-name').textContent = teacher.name;
    document.getElementById('detail-teacher-id').textContent = teacher.id;
    
    // Set status badge
    const statusElement = document.getElementById('detail-teacher-status');
    if (statusElement) {
        if (teacher.status === 'active' || !teacher.status) {
            statusElement.className = 'badge bg-success';
            statusElement.textContent = 'Active';
        } else if (teacher.status === 'on-leave') {
            statusElement.className = 'badge bg-warning';
            statusElement.textContent = 'On Leave';
        } else {
            statusElement.className = 'badge bg-secondary';
            statusElement.textContent = 'Inactive';
        }
    }
    
    // Set contact info
    document.getElementById('detail-teacher-email').textContent = teacher.email || '-';
    document.getElementById('detail-teacher-phone').textContent = teacher.phone || '-';
    document.getElementById('detail-teacher-gender').textContent = teacher.gender || '-';
    
    // Format dates
    const dobDate = teacher.dateOfBirth ? new Date(teacher.dateOfBirth) : null;
    const joinDate = teacher.joinDate ? new Date(teacher.joinDate) : null;
    
    document.getElementById('detail-teacher-dob').textContent = dobDate 
        ? dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : '-';
    
    document.getElementById('detail-teacher-join-date').textContent = joinDate 
        ? joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : '-';
    
    document.getElementById('detail-teacher-address').textContent = teacher.address || '-';
    
    // Set subjects
    const subjectsContainer = document.getElementById('detail-teacher-subjects');
    if (subjectsContainer) {
        if (!teacher.subjects || teacher.subjects.length === 0) {
            subjectsContainer.innerHTML = '<p class="text-muted">No subjects assigned</p>';
        } else {
            subjectsContainer.innerHTML = teacher.subjects.map(subject => 
                `<span class="badge bg-primary m-1">${subject}</span>`
            ).join('');
        }
    }
    
    // Set assigned classes
    const classesContainer = document.getElementById('detail-teacher-classes');
    if (classesContainer) {
        if (!teacher.assignedClasses || teacher.assignedClasses.length === 0) {
            classesContainer.innerHTML = '<p class="text-muted">No classes assigned</p>';
        } else {
            classesContainer.innerHTML = teacher.assignedClasses.map(classSection => 
                `<span class="badge bg-info m-1">${classSection}</span>`
            ).join('');
        }
    }
    
    // Set schedule
    const scheduleBody = document.getElementById('teacher-schedule-body');
    if (scheduleBody) {
        // In a real app, we would fetch the teacher's schedule from the database
        // For now, we'll just show a placeholder schedule based on assigned classes
        if (!teacher.assignedClasses || teacher.assignedClasses.length === 0) {
            scheduleBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No schedule available</td>
                </tr>
            `;
        } else {
            // Generate a simple schedule based on assigned classes and subjects
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const timeSlots = ['8:30 - 9:20', '9:30 - 10:20', '10:30 - 11:20', '11:30 - 12:20', '1:30 - 2:20'];
            
            const scheduleRows = [];
            let scheduleIndex = 0;
            
            teacher.assignedClasses.forEach((classSection, classIndex) => {
                if (teacher.subjects && teacher.subjects.length > 0) {
                    const subject = teacher.subjects[classIndex % teacher.subjects.length];
                    const day = days[scheduleIndex % days.length];
                    const timeSlot = timeSlots[scheduleIndex % timeSlots.length];
                    const roomNo = 100 + (classIndex % 5) + 1;
                    
                    scheduleRows.push(`
                        <tr>
                            <td>${day}</td>
                            <td>${timeSlot}</td>
                            <td>${classSection}</td>
                            <td>${subject}</td>
                            <td>${roomNo}</td>
                        </tr>
                    `);
                    
                    scheduleIndex++;
                }
            });
            
            scheduleBody.innerHTML = scheduleRows.join('');
        }
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewTeacherModal'));
    modal.show();
}

/**
 * Edit teacher
 * @param {string} teacherId - Teacher ID
 */
function editTeacher(teacherId) {
    // Implementation will be added in future updates
    alert('Edit teacher functionality will be added in future updates');
}

/**
 * Delete teacher
 * @param {string} teacherId - Teacher ID
 */
function deleteTeacher(teacherId) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete teacher with ID ${teacherId}?`)) {
        return;
    }
    
    // Check if teacher is assigned to any class
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const assignedToClass = classes.some(cls => cls.teacherId === teacherId);
    
    if (assignedToClass) {
        showAlert(`Cannot delete teacher with ID ${teacherId} because they are assigned to one or more classes. Please reassign the classes first.`, 'warning');
        return;
    }
    
    // Get users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Filter out the teacher to delete
    const filteredUsers = users.filter(user => !(user.id === teacherId && user.type === 'teacher'));
    
    // Save to storage
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // Show success message
    showAlert(`Teacher with ID ${teacherId} deleted successfully`, 'success');
    
    // Reload teachers
    loadTeachers();
}