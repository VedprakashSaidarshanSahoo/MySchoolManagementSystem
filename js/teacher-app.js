/**
 * School Management System
 * Teacher Portal JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in as a teacher
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    } else if (currentUser.type !== 'teacher') {
        // Redirect to appropriate dashboard if not a teacher
        if (currentUser.type === 'admin') {
            window.location.href = 'index.html';
        } else {
            // Show error and redirect to login
            alert('You do not have access to the teacher portal. Please login with the correct credentials.');
            logout();
            return;
        }
    }

    // Initialize the teacher app
    initTeacherApp();
});

/**
 * Initialize the teacher portal application
 */
function initTeacherApp() {
    console.log('Initializing teacher portal...');
    
    // Set teacher name in header
    setTeacherInfo();
    
    // Setup sidebar menu events
    setupSidebarMenuEvents();
    
    // Setup sidebar toggle for mobile
    setupSidebarToggle();
    
    // Load default page (dashboard)
    loadTeacherPage('teacher-dashboard');
    
    // Setup logout event
    document.getElementById('logout-button').addEventListener('click', logout);
    document.getElementById('header-logout').addEventListener('click', logout);
}

/**
 * Set teacher information in the sidebar
 */
function setTeacherInfo() {
    const currentUser = getCurrentUser();
    const teacherNameElements = document.querySelectorAll('#teacher-name, #welcome-teacher-name');
    
    teacherNameElements.forEach(el => {
        if (el) {
            el.textContent = currentUser.name;
        }
    });
}

/**
 * Setup sidebar menu events
 */
function setupSidebarMenuEvents() {
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
            loadTeacherPage(pageName);
            
            // Close sidebar on mobile after selection
            if (window.innerWidth < 768) {
                document.getElementById('sidebar').classList.remove('show');
            }
        });
    });
}

/**
 * Setup sidebar toggle for mobile
 */
function setupSidebarToggle() {
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
 * Load a teacher portal page
 * @param {string} pageName - Name of the page to load
 */
function loadTeacherPage(pageName) {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;
    
    // Set header title based on page
    const headerTitle = document.querySelector('.header-title h4');
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
    
    // Get page content
    const pageUrl = getPageUrl(pageName);
    
    fetch(pageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Set page content
            pageContent.innerHTML = html;
            
            // Initialize page-specific scripts
            initTeacherPageScripts(pageName);
        })
        .catch(error => {
            console.error('Error loading page:', error);
            pageContent.innerHTML = `
                <div class="alert alert-danger m-3" role="alert">
                    <h4 class="alert-heading">Error Loading Page</h4>
                    <p>Sorry, there was an error loading the requested page. Please try again later.</p>
                    <hr>
                    <p class="mb-0">Error details: ${error.message}</p>
                </div>
            `;
        });
}

/**
 * Get URL for a specific teacher page
 * @param {string} pageName - Name of the page
 * @returns {string} - URL of the page
 */
function getPageUrl(pageName) {
    switch (pageName) {
        case 'teacher-dashboard':
            return 'pages/teacher/dashboard.html';
        case 'my-classes':
            return 'pages/teacher/classes.html';
        case 'attendance':
            return 'pages/teacher/attendance.html';
        case 'time-table':
            return 'pages/teacher/timetable.html';
        case 'student-reports':
            return 'pages/teacher/student-reports.html';
        case 'profile':
            return 'pages/teacher/profile.html';
        default:
            return 'pages/teacher/dashboard.html';
    }
}

/**
 * Get title for a specific teacher page
 * @param {string} pageName - Name of the page
 * @returns {string} - Title of the page
 */
function getPageTitle(pageName) {
    switch (pageName) {
        case 'teacher-dashboard':
            return 'Teacher Dashboard';
        case 'my-classes':
            return 'My Classes';
        case 'attendance':
            return 'Attendance Management';
        case 'time-table':
            return 'Time Table';
        case 'student-reports':
            return 'Student Reports';
        case 'profile':
            return 'My Profile';
        default:
            return 'Teacher Portal';
    }
}

/**
 * Initialize page-specific scripts based on the loaded page
 * @param {string} pageName - The name of the loaded page
 */
function initTeacherPageScripts(pageName) {
    console.log(`Initializing scripts for page: ${pageName}`);
    
    // Set current date
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }
    
    // Initialize page-specific functionality
    switch (pageName) {
        case 'teacher-dashboard':
            initTeacherDashboard();
            break;
        case 'attendance':
            initAttendancePage();
            break;
        case 'my-classes':
            initClassesPage();
            break;
        case 'student-reports':
            initStudentReportsPage();
            break;
        // Add more page initializations as needed
    }
}

/**
 * Initialize the teacher dashboard page
 */
function initTeacherDashboard() {
    console.log('Initializing teacher dashboard...');
    
    // Get teacher data
    const currentUser = getCurrentUser();
    
    // Find teacher in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacher = users.find(user => user.id === currentUser.id);
    
    if (teacher) {
        // Update dashboard stats
        const classesCount = document.getElementById('classes-count');
        if (classesCount) {
            classesCount.textContent = teacher.assignedClasses ? teacher.assignedClasses.length : 0;
        }
        
        // Add more dashboard initializations here
    }
    
    // Setup event handlers for dashboard elements
    setupDashboardEventHandlers();
}

/**
 * Set up event handlers for dashboard elements
 */
function setupDashboardEventHandlers() {
    // Example: setup task checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const label = checkbox.nextElementSibling;
            if (checkbox.checked) {
                label.style.textDecoration = 'line-through';
                label.style.opacity = '0.7';
            } else {
                label.style.textDecoration = 'none';
                label.style.opacity = '1';
            }
        });
    });
    
    // Add more event handlers as needed
}

/**
 * Initialize the attendance page
 */
function initAttendancePage() {
    console.log('Initializing attendance page...');
    
    // Set current date in the date input
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) {
        const today = new Date().toISOString().slice(0, 10);
        dateInput.value = today;
    }
    
    // Setup class and subject change handlers
    const classSelect = document.getElementById('attendance-class');
    const subjectSelect = document.getElementById('attendance-subject');
    
    if (classSelect && subjectSelect) {
        // Load students when both class and subject are selected
        const loadStudentsHandler = () => {
            if (classSelect.value && subjectSelect.value) {
                loadStudentsForAttendance();
            }
        };
        
        classSelect.addEventListener('change', loadStudentsHandler);
        subjectSelect.addEventListener('change', loadStudentsHandler);
    }
    
    // Setup mark all buttons
    const markAllPresentBtn = document.getElementById('mark-all-present-btn');
    if (markAllPresentBtn) {
        markAllPresentBtn.addEventListener('click', () => markAllAttendance('present'));
    }
    
    const markAllAbsentBtn = document.getElementById('mark-all-absent-btn');
    if (markAllAbsentBtn) {
        markAllAbsentBtn.addEventListener('click', () => markAllAttendance('absent'));
    }
    
    // Setup save attendance button
    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', saveAttendance);
    }
    
    // Setup attendance history button
    const attendanceHistoryBtn = document.getElementById('attendance-history-btn');
    if (attendanceHistoryBtn) {
        attendanceHistoryBtn.addEventListener('click', () => {
            const historySection = document.getElementById('attendance-history-section');
            if (historySection) {
                historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
                attendanceHistoryBtn.innerHTML = historySection.style.display === 'none' ? 
                    '<i class="fas fa-history me-1"></i> Attendance History' : 
                    '<i class="fas fa-times me-1"></i> Close History';
                    
                // Refresh history if displayed
                if (historySection.style.display === 'block') {
                    refreshAttendanceHistory();
                }
            }
        });
    }
    
    // Setup history filter button
    const filterHistoryBtn = document.getElementById('filter-history-btn');
    if (filterHistoryBtn) {
        filterHistoryBtn.addEventListener('click', refreshAttendanceHistory);
    }
    
    // Setup export history button
    const exportHistoryBtn = document.getElementById('export-history-btn');
    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', () => {
            // Export attendance history as CSV
            const records = getFilteredAttendanceRecords();
            if (records && records.length > 0) {
                const exportData = records.map(record => {
                    return {
                        Date: record.date,
                        Class: record.class,
                        Subject: record.subject,
                        Present: record.presentCount,
                        Absent: record.absentCount,
                        Leave: record.leaveCount,
                        'Attendance %': record.attendancePercentage + '%'
                    };
                });
                
                downloadCSV(exportData, `attendance_history_${new Date().toISOString().slice(0, 10)}.csv`);
            } else {
                showAlert('No attendance records to export', 'warning');
            }
        });
    }
}

/**
 * Load students for attendance
 */
function loadStudentsForAttendance() {
    const attendanceClass = document.getElementById('attendance-class').value;
    const attendanceDate = document.getElementById('attendance-date').value;
    const attendanceSubject = document.getElementById('attendance-subject').value;
    
    // Validate inputs
    if (!attendanceClass || !attendanceDate || !attendanceSubject) {
        showAlert('Please select a class, date, and subject', 'warning');
        return;
    }
    
    // Show loading state
    const loadingState = document.getElementById('attendance-loading');
    const emptyState = document.getElementById('attendance-empty');
    const tableContainer = document.getElementById('attendance-table-container');
    
    if (loadingState) loadingState.classList.remove('d-none');
    if (emptyState) emptyState.classList.add('d-none');
    if (tableContainer) tableContainer.classList.add('d-none');
    
    // Get students for the selected class
    // In a real app, this would be an API call
    setTimeout(() => {
        // Get students from localStorage
        const students = getAllStudents().filter(student => {
            const classSection = `${student.admissionClass}-${student.section}`;
            return classSection === attendanceClass;
        });
        
        // Hide loading state
        if (loadingState) loadingState.classList.add('d-none');
        
        // Check if we have students
        if (students && students.length > 0) {
            populateAttendanceTable(students);
            if (tableContainer) tableContainer.classList.remove('d-none');
        } else {
            if (emptyState) emptyState.classList.remove('d-none');
            showAlert(`No students found for class ${attendanceClass}`, 'info');
        }
    }, 1000);
}

/**
 * Populate the attendance table with students
 * @param {Array} students - Array of student objects
 */
function populateAttendanceTable(students) {
    const tableBody = document.getElementById('attendance-table-body');
    if (!tableBody) return;
    
    // Clear previous data
    tableBody.innerHTML = '';
    
    // Add student rows
    students.forEach((student, index) => {
        const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${fullName}</td>
            <td>${student.rollNo || ''}</td>
            <td>
                <div class="form-check form-check-inline">
                    <input class="form-check-input status-radio" type="radio" name="status-${student.id}" 
                        id="present-${student.id}" value="present" data-student-id="${student.id}" checked>
                    <label class="form-check-label" for="present-${student.id}">Present</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input status-radio" type="radio" name="status-${student.id}" 
                        id="absent-${student.id}" value="absent" data-student-id="${student.id}">
                    <label class="form-check-label" for="absent-${student.id}">Absent</label>
                </div>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm" id="remarks-${student.id}" 
                    placeholder="Add remarks">
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Setup event listeners for attendance status changes
    setupAttendanceStatusListeners();
    
    // Update counters
    updateAttendanceCounters();
}

/**
 * Setup event listeners for attendance status changes
 */
function setupAttendanceStatusListeners() {
    const statusRadios = document.querySelectorAll('.status-radio');
    
    statusRadios.forEach(radio => {
        radio.addEventListener('change', updateAttendanceCounters);
    });
}

/**
 * Update attendance counters
 */
function updateAttendanceCounters() {
    const presentCount = document.getElementById('present-count');
    const absentCount = document.getElementById('absent-count');
    const totalCount = document.getElementById('total-count');
    
    const allRadios = document.querySelectorAll('.status-radio');
    const totalStudents = allRadios.length / 2; // Divide by 2 because we have 2 radios per student
    
    const presentRadios = document.querySelectorAll('.status-radio[value="present"]:checked');
    const presentStudents = presentRadios.length;
    const absentStudents = totalStudents - presentStudents;
    
    if (presentCount) presentCount.textContent = presentStudents;
    if (absentCount) absentCount.textContent = absentStudents;
    if (totalCount) totalCount.textContent = totalStudents;
}

/**
 * Mark all students as present or absent
 * @param {string} status - 'present' or 'absent'
 */
function markAllAttendance(status) {
    const statusRadios = document.querySelectorAll(`.status-radio[value="${status}"]`);
    
    statusRadios.forEach(radio => {
        radio.checked = true;
    });
    
    updateAttendanceCounters();
}

/**
 * Save attendance data
 */
function saveAttendance() {
    const attendanceClass = document.getElementById('attendance-class').value;
    const attendanceDate = document.getElementById('attendance-date').value;
    const attendanceSubject = document.getElementById('attendance-subject').value;
    
    // Validate inputs
    if (!attendanceClass || !attendanceDate || !attendanceSubject) {
        showAlert('Please select a class, date, and subject', 'warning');
        return;
    }
    
    // Get all student attendance data
    const attendanceData = [];
    const statusRadios = document.querySelectorAll('.status-radio:checked');
    
    statusRadios.forEach(radio => {
        const studentId = radio.dataset.studentId;
        const status = radio.value;
        const remarks = document.getElementById(`remarks-${studentId}`).value;
        const student = getStudentById(studentId);
        
        if (student) {
            attendanceData.push({
                studentId,
                studentName: `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim(),
                rollNo: student.rollNo,
                status,
                remarks
            });
        }
    });
    
    // Create attendance record
    const attendanceRecord = {
        id: generateUniqueId(),
        class: attendanceClass,
        date: attendanceDate,
        subject: attendanceSubject,
        students: attendanceData,
        presentCount: document.getElementById('present-count').textContent,
        absentCount: document.getElementById('absent-count').textContent,
        totalCount: document.getElementById('total-count').textContent,
        createdAt: new Date().toISOString(),
        createdBy: getCurrentUser().id
    };
    
    // Save attendance record
    saveAttendanceRecord(attendanceRecord);
    
    // Show success message
    showAlert('Attendance saved successfully', 'success');
    
    // Refresh attendance history
    refreshAttendanceHistory();
}

/**
 * Save attendance record to localStorage
 * @param {object} record - Attendance record
 */
function saveAttendanceRecord(record) {
    // Get existing records
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    // Add new record
    records.push(record);
    
    // Save to localStorage
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
}

/**
 * Setup attendance history filters
 */
function setupAttendanceHistoryFilters() {
    const historyClass = document.getElementById('history-class');
    const historyFromDate = document.getElementById('history-from-date');
    const historyToDate = document.getElementById('history-to-date');
    const refreshHistoryBtn = document.getElementById('refresh-history-btn');
    
    // Set default dates
    if (historyFromDate) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        historyFromDate.value = lastMonth.toISOString().slice(0, 10);
    }
    
    if (historyToDate) {
        const today = new Date().toISOString().slice(0, 10);
        historyToDate.value = today;
    }
    
    // Add event listeners
    const filterElements = [historyClass, historyFromDate, historyToDate];
    
    filterElements.forEach(element => {
        if (element) {
            element.addEventListener('change', refreshAttendanceHistory);
        }
    });
    
    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', refreshAttendanceHistory);
    }
    
    // Initial load
    refreshAttendanceHistory();
}

/**
 * Refresh the attendance history table
 */
function refreshAttendanceHistory() {
    // Get filter values
    const historyClass = document.getElementById('history-class')?.value || '';
    const historyFromDate = document.getElementById('history-from-date')?.value || '';
    const historyToDate = document.getElementById('history-to-date')?.value || '';
    
    // Get attendance records
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    // Filter records
    const filteredRecords = records.filter(record => {
        let matchesClass = true;
        let matchesDateRange = true;
        
        if (historyClass) {
            matchesClass = record.class === historyClass;
        }
        
        if (historyFromDate) {
            matchesDateRange = record.date >= historyFromDate;
        }
        
        if (historyToDate) {
            matchesDateRange = matchesDateRange && record.date <= historyToDate;
        }
        
        return matchesClass && matchesDateRange;
    });
    
    // Sort records by date (newest first)
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update table
    const historyBody = document.getElementById('attendance-history-body');
    if (!historyBody) return;
    
    if (filteredRecords.length === 0) {
        historyBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <p class="mb-0">No attendance records found for the selected criteria</p>
                </td>
            </tr>
        `;
        return;
    }
    
    historyBody.innerHTML = filteredRecords.map(record => {
        const formattedDate = new Date(record.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const percentage = Math.round((parseInt(record.presentCount) / parseInt(record.totalCount)) * 100);
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${record.class}</td>
                <td>${record.subject}</td>
                <td>${record.presentCount}</td>
                <td>${record.absentCount}</td>
                <td>${percentage}%</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-primary me-1 view-attendance-btn" data-record-id="${record.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-warning me-1 edit-attendance-btn" data-record-id="${record.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-attendance-btn" data-record-id="${record.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup view attendance buttons
    setupViewAttendanceButtons();
}

/**
 * Setup view attendance buttons
 */
function setupViewAttendanceButtons() {
    const viewButtons = document.querySelectorAll('.view-attendance-btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const recordId = button.dataset.recordId;
            viewAttendanceRecord(recordId);
        });
    });
    
    // Setup edit and delete buttons similarly
}

/**
 * View attendance record
 * @param {string} recordId - Attendance record ID
 */
function viewAttendanceRecord(recordId) {
    // Get attendance record
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const record = records.find(r => r.id === recordId);
    
    if (!record) {
        showAlert('Attendance record not found', 'danger');
        return;
    }
    
    // Set modal data
    document.getElementById('modal-class').textContent = record.class;
    document.getElementById('modal-date').textContent = new Date(record.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    document.getElementById('modal-subject').textContent = record.subject;
    
    // Set modal table data
    const modalTableBody = document.getElementById('modal-attendance-table-body');
    if (modalTableBody) {
        modalTableBody.innerHTML = record.students.map((student, index) => {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${student.studentName}</td>
                    <td>${student.rollNo || ''}</td>
                    <td>
                        <span class="badge ${student.status === 'present' ? 'bg-success' : 'bg-danger'}">
                            ${student.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                    </td>
                    <td>${student.remarks || '-'}</td>
                </tr>
            `;
        }).join('');
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('view-attendance-modal'));
    modal.show();
}

/**
 * Initialize the classes page
 */
function initClassesPage() {
    console.log('Initializing classes page...');
    
    // Implementation will be added
}

/**
 * Initialize the student reports page
 */
function initStudentReportsPage() {
    console.log('Initializing student reports page...');
    
    // Implementation will be added
}