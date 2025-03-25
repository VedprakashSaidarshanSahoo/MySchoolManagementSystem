/**
 * School Management System
 * Attendance Management Module
 */

/**
 * Initialize the attendance management page
 */
function initAttendanceManagement() {
    console.log('Initializing attendance management...');
    
    // Set today's date in the date input
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) {
        const today = new Date().toISOString().slice(0, 10);
        dateInput.value = today;
    }
    
    // Set filter dates (last 30 days)
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    
    if (filterDateFrom && filterDateTo) {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        filterDateFrom.value = thirtyDaysAgo.toISOString().slice(0, 10);
        filterDateTo.value = today.toISOString().slice(0, 10);
    }
    
    // Setup event listeners
    setupAttendanceManagementEvents();
    
    // Load attendance records
    loadAttendanceRecords();
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltips.length > 0) {
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }
}

/**
 * Setup event listeners for attendance management
 */
function setupAttendanceManagementEvents() {
    // Load students button
    const loadStudentsBtn = document.getElementById('load-students-btn');
    if (loadStudentsBtn) {
        loadStudentsBtn.addEventListener('click', loadStudentsForAttendance);
    }
    
    // Mark all present/absent buttons
    const markAllPresentBtn = document.getElementById('mark-all-present');
    if (markAllPresentBtn) {
        markAllPresentBtn.addEventListener('click', () => markAllAttendance('present'));
    }
    
    const markAllAbsentBtn = document.getElementById('mark-all-absent');
    if (markAllAbsentBtn) {
        markAllAbsentBtn.addEventListener('click', () => markAllAttendance('absent'));
    }
    
    // Save attendance button
    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', saveAttendance);
    }
    
    // Update attendance button
    const updateAttendanceBtn = document.getElementById('update-attendance-btn');
    if (updateAttendanceBtn) {
        updateAttendanceBtn.addEventListener('click', updateAttendance);
    }
    
    // Print attendance button
    const printAttendanceBtn = document.getElementById('print-attendance-btn');
    if (printAttendanceBtn) {
        printAttendanceBtn.addEventListener('click', printAttendance);
    }
    
    // Filter buttons
    const applyFilterBtn = document.getElementById('apply-filter-btn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            loadAttendanceRecords();
        });
    }
    
    const resetFilterBtn = document.getElementById('reset-filter-btn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            // Reset filter inputs
            const filterClass = document.getElementById('filter-class');
            const filterDateFrom = document.getElementById('filter-date-from');
            const filterDateTo = document.getElementById('filter-date-to');
            
            if (filterClass) filterClass.value = '';
            
            if (filterDateFrom && filterDateTo) {
                const today = new Date();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(today.getDate() - 30);
                
                filterDateFrom.value = thirtyDaysAgo.toISOString().slice(0, 10);
                filterDateTo.value = today.toISOString().slice(0, 10);
            }
            
            // Reload records
            loadAttendanceRecords();
        });
    }
    
    // Export button
    const exportAttendanceBtn = document.getElementById('export-attendance-btn');
    if (exportAttendanceBtn) {
        exportAttendanceBtn.addEventListener('click', exportAttendance);
    }
    
    // Setup event delegation for action buttons
    document.addEventListener('click', (e) => {
        // View attendance details
        if (e.target.closest('.btn-outline-primary')) {
            const btn = e.target.closest('.btn-outline-primary');
            const row = btn.closest('tr');
            if (row) {
                const date = row.cells[0].textContent;
                const classSection = row.cells[1].textContent;
                const subject = row.cells[2].textContent;
                
                viewAttendanceDetails(date, classSection, subject);
            }
        }
        
        // Edit attendance
        if (e.target.closest('.btn-outline-warning')) {
            const btn = e.target.closest('.btn-outline-warning');
            const row = btn.closest('tr');
            if (row) {
                const date = row.cells[0].textContent;
                const classSection = row.cells[1].textContent;
                const subject = row.cells[2].textContent;
                
                editAttendanceRecord(date, classSection, subject);
            }
        }
        
        // Delete attendance
        if (e.target.closest('.btn-outline-danger')) {
            const btn = e.target.closest('.btn-outline-danger');
            const row = btn.closest('tr');
            if (row) {
                const date = row.cells[0].textContent;
                const classSection = row.cells[1].textContent;
                const subject = row.cells[2].textContent;
                
                deleteAttendanceRecord(date, classSection, subject);
            }
        }
    });
}

/**
 * Load students for attendance
 */
function loadStudentsForAttendance() {
    const attendanceClass = document.getElementById('attendance-class')?.value || '';
    const attendanceDate = document.getElementById('attendance-date')?.value || '';
    const attendanceSubject = document.getElementById('attendance-subject')?.value || '';
    
    // Validate inputs
    if (!attendanceClass || !attendanceDate || !attendanceSubject) {
        showAlert('Please select class, date, and subject', 'warning');
        return;
    }
    
    // Check if attendance already exists for this class, date, and subject
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const existingRecord = attendanceRecords.find(record => 
        record.class === attendanceClass && 
        record.date === attendanceDate && 
        record.subject === attendanceSubject
    );
    
    if (existingRecord) {
        const confirmEdit = confirm('Attendance record already exists for this class, date, and subject. Would you like to edit it?');
        if (confirmEdit) {
            editAttendanceRecord(formatDate(new Date(attendanceDate)), attendanceClass, attendanceSubject);
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('recordAttendanceModal'));
            if (modal) {
                modal.hide();
            }
        }
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
    }, 500); // Simulate loading delay
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
    updateCounter('present-count', 'absent-count', 'total-count');
}

/**
 * Update edit attendance counters
 */
function updateEditAttendanceCounters() {
    updateCounter('edit-present-count', 'edit-absent-count', 'edit-total-count');
}

/**
 * Update counter elements with attendance statistics
 * @param {string} presentId - ID of present count element
 * @param {string} absentId - ID of absent count element
 * @param {string} totalId - ID of total count element
 */
function updateCounter(presentId, absentId, totalId) {
    const presentCount = document.getElementById(presentId);
    const absentCount = document.getElementById(absentId);
    const totalCount = document.getElementById(totalId);
    
    // Find all radio buttons in the relevant container
    const container = presentId === 'present-count' ? 'attendance-table-body' : 'edit-attendance-table-body';
    const allRadios = document.querySelectorAll(`#${container} .status-radio`);
    const totalStudents = allRadios.length / 2; // Divide by 2 because we have 2 radios per student
    
    const presentRadios = document.querySelectorAll(`#${container} .status-radio[value="present"]:checked`);
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
    const attendanceClass = document.getElementById('attendance-class')?.value || '';
    const attendanceDate = document.getElementById('attendance-date')?.value || '';
    const attendanceSubject = document.getElementById('attendance-subject')?.value || '';
    
    // Validate inputs
    if (!attendanceClass || !attendanceDate || !attendanceSubject) {
        showAlert('Please select class, date, and subject', 'warning');
        return;
    }
    
    // Get all student attendance data
    const attendanceData = [];
    const statusRadios = document.querySelectorAll('#attendance-table-body .status-radio:checked');
    
    statusRadios.forEach(radio => {
        const studentId = radio.dataset.studentId;
        const status = radio.value;
        const remarks = document.getElementById(`remarks-${studentId}`)?.value || '';
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
    
    // Get current user
    const currentUser = getCurrentUser();
    const teacherName = currentUser ? currentUser.name : 'Admin';
    
    // Create attendance record
    const attendanceRecord = {
        id: generateUniqueId(),
        class: attendanceClass,
        date: attendanceDate,
        subject: attendanceSubject,
        teacher: teacherName,
        teacherId: currentUser ? currentUser.id : 'admin',
        students: attendanceData,
        presentCount: document.getElementById('present-count').textContent,
        absentCount: document.getElementById('absent-count').textContent,
        totalCount: document.getElementById('total-count').textContent,
        createdAt: new Date().toISOString(),
        createdBy: currentUser ? currentUser.id : 'admin'
    };
    
    // Save attendance record
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    attendanceRecords.push(attendanceRecord);
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    
    // Show success message
    showAlert('Attendance saved successfully', 'success');
    
    // Reload attendance records
    loadAttendanceRecords();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('recordAttendanceModal'));
    if (modal) {
        modal.hide();
    }
}

/**
 * Load attendance records
 */
function loadAttendanceRecords() {
    // Get filter values
    const filterClass = document.getElementById('filter-class')?.value || '';
    const filterDateFrom = document.getElementById('filter-date-from')?.value || '';
    const filterDateTo = document.getElementById('filter-date-to')?.value || '';
    
    // Get attendance records
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    // Filter records
    const filteredRecords = attendanceRecords.filter(record => {
        let matchesClass = true;
        let matchesDateRange = true;
        
        if (filterClass) {
            matchesClass = record.class === filterClass;
        }
        
        if (filterDateFrom) {
            matchesDateRange = record.date >= filterDateFrom;
        }
        
        if (filterDateTo) {
            matchesDateRange = matchesDateRange && record.date <= filterDateTo;
        }
        
        return matchesClass && matchesDateRange;
    });
    
    // Sort records by date (newest first)
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update attendance summary
    updateAttendanceSummary(filteredRecords, attendanceRecords);
    
    // Update attendance table
    displayAttendanceRecords(filteredRecords);
    
    // Update charts
    updateAttendanceCharts(filteredRecords);
}

/**
 * Update attendance summary stats
 * @param {Array} filteredRecords - Filtered attendance records
 * @param {Array} allRecords - All attendance records
 */
function updateAttendanceSummary(filteredRecords, allRecords) {
    // Get classes count
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    document.getElementById('total-classes').textContent = classes.length;
    
    // Calculate today's attendance
    const today = new Date().toISOString().slice(0, 10);
    const todayRecords = allRecords.filter(record => record.date === today);
    
    let presentToday = 0;
    let totalToday = 0;
    
    todayRecords.forEach(record => {
        presentToday += parseInt(record.presentCount);
        totalToday += parseInt(record.totalCount);
    });
    
    document.getElementById('today-attendance').textContent = `${presentToday}/${totalToday}`;
    
    // Calculate overall attendance rate
    let totalPresent = 0;
    let totalStudents = 0;
    
    allRecords.forEach(record => {
        totalPresent += parseInt(record.presentCount);
        totalStudents += parseInt(record.totalCount);
    });
    
    const overallRate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;
    document.getElementById('overall-rate').textContent = `${overallRate}%`;
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${overallRate}%`;
        progressBar.setAttribute('aria-valuenow', overallRate);
    }
}

/**
 * Display attendance records in the table
 * @param {Array} records - Array of attendance records
 */
function displayAttendanceRecords(records) {
    const tableBody = document.getElementById('attendance-table-body');
    if (!tableBody) return;
    
    // Clear previous data
    tableBody.innerHTML = '';
    
    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No attendance records found</td>
            </tr>
        `;
        return;
    }
    
    // Add record rows
    records.forEach(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const present = parseInt(record.presentCount);
        const total = parseInt(record.totalCount);
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.class}</td>
            <td>${record.subject}</td>
            <td>${record.teacher || 'Admin'}</td>
            <td>${record.presentCount}</td>
            <td>${record.absentCount}</td>
            <td>
                <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%;" 
                        aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <small class="text-muted">${percentage}%</small>
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-primary me-1" data-bs-toggle="tooltip" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-warning me-1" data-bs-toggle="tooltip" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-bs-toggle="tooltip" title="Delete">
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
 * Update attendance charts
 * @param {Array} records - Array of attendance records
 */
function updateAttendanceCharts(records) {
    // Trend chart data (last 7 days)
    const last7Days = [];
    const attendanceRates = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().slice(0, 10));
    }
    
    // Calculate attendance rates for each day
    last7Days.forEach(day => {
        const dayRecords = records.filter(record => record.date === day);
        
        let presentCount = 0;
        let totalCount = 0;
        
        dayRecords.forEach(record => {
            presentCount += parseInt(record.presentCount);
            totalCount += parseInt(record.totalCount);
        });
        
        const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        attendanceRates.push(rate);
    });
    
    // Format dates for display
    const formattedDates = last7Days.map(day => {
        const date = new Date(day);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Update trend chart
    updateAttendanceTrendChart(formattedDates, attendanceRates);
    
    // Class-wise attendance data
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const classLabels = classes.map(cls => `${cls.className}-${cls.section}`);
    const classRates = [];
    
    classLabels.forEach(classLabel => {
        const classRecords = records.filter(record => record.class === classLabel);
        
        let presentCount = 0;
        let totalCount = 0;
        
        classRecords.forEach(record => {
            presentCount += parseInt(record.presentCount);
            totalCount += parseInt(record.totalCount);
        });
        
        const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        classRates.push(rate);
    });
    
    // Update class-wise chart
    updateClassAttendanceChart(classLabels, classRates);
}

/**
 * Update attendance trend chart
 * @param {Array} dates - Array of formatted dates
 * @param {Array} rates - Array of attendance rates
 */
function updateAttendanceTrendChart(dates, rates) {
    // Find existing Chart.js instance and destroy it
    const chartCanvas = document.getElementById('attendanceTrendChart');
    if (chartCanvas) {
        const chartInstance = Chart.getChart(chartCanvas);
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // Create new chart
        new Chart(chartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Attendance Rate (%)',
                    data: rates,
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 70,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Weekly Attendance Trend'
                    }
                }
            }
        });
    }
}

/**
 * Update class attendance chart
 * @param {Array} classes - Array of class labels
 * @param {Array} rates - Array of attendance rates
 */
function updateClassAttendanceChart(classes, rates) {
    // Find existing Chart.js instance and destroy it
    const chartCanvas = document.getElementById('classAttendanceChart');
    if (chartCanvas) {
        const chartInstance = Chart.getChart(chartCanvas);
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // Create new chart
        new Chart(chartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: classes,
                datasets: [{
                    label: 'Present (%)',
                    data: rates,
                    backgroundColor: [
                        'rgba(28, 200, 138, 0.8)',
                        'rgba(28, 200, 138, 0.8)',
                        'rgba(28, 200, 138, 0.8)'
                    ],
                    borderColor: [
                        'rgba(28, 200, 138, 1)',
                        'rgba(28, 200, 138, 1)',
                        'rgba(28, 200, 138, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Class'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Class-wise Attendance Rate'
                    }
                }
            }
        });
    }
}

/**
 * View attendance details
 * @param {string} date - Attendance date
 * @param {string} classSection - Class name and section
 * @param {string} subject - Subject name
 */
function viewAttendanceDetails(date, classSection, subject) {
    // Parse date string
    const dateParts = date.split(' ');
    const month = dateParts[0];
    const day = parseInt(dateParts[1].replace(',', ''));
    const year = parseInt(dateParts[2]);
    
    // Create date object
    const dateObj = new Date(`${month} ${day}, ${year}`);
    const isoDate = dateObj.toISOString().slice(0, 10);
    
    // Get attendance record
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const record = attendanceRecords.find(rec => 
        rec.class === classSection && 
        rec.date === isoDate && 
        rec.subject === subject
    );
    
    if (!record) {
        showAlert('Attendance record not found', 'danger');
        return;
    }
    
    // Set modal title
    document.getElementById('viewAttendanceModalLabel').textContent = `Attendance Details: ${classSection} - ${date}`;
    
    // Set basic info
    document.getElementById('detail-class').textContent = record.class;
    document.getElementById('detail-date').textContent = date;
    document.getElementById('detail-subject').textContent = record.subject;
    document.getElementById('detail-teacher').textContent = record.teacher || 'Admin';
    document.getElementById('detail-status').textContent = 'Completed';
    
    // Calculate percentage
    const present = parseInt(record.presentCount);
    const total = parseInt(record.totalCount);
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    document.getElementById('detail-rate').textContent = `${percentage}%`;
    
    // Populate students table
    const tableBody = document.getElementById('detail-attendance-table-body');
    if (tableBody) {
        if (!record.students || record.students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No student data available</td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = record.students.map((student, index) => {
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${student.studentName}</td>
                        <td>${student.rollNo || '-'}</td>
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
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewAttendanceModal'));
    modal.show();
}

/**
 * Edit attendance record
 * @param {string} date - Attendance date
 * @param {string} classSection - Class name and section
 * @param {string} subject - Subject name
 */
function editAttendanceRecord(date, classSection, subject) {
    // Parse date string
    const dateParts = date.split(' ');
    const month = dateParts[0];
    const day = parseInt(dateParts[1].replace(',', ''));
    const year = parseInt(dateParts[2]);
    
    // Create date object
    const dateObj = new Date(`${month} ${day}, ${year}`);
    const isoDate = dateObj.toISOString().slice(0, 10);
    
    // Get attendance record
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const record = attendanceRecords.find(rec => 
        rec.class === classSection && 
        rec.date === isoDate && 
        rec.subject === subject
    );
    
    if (!record) {
        showAlert('Attendance record not found', 'danger');
        return;
    }
    
    // Set modal title
    document.getElementById('editAttendanceModalLabel').textContent = `Edit Attendance: ${classSection} - ${date}`;
    
    // Set form data
    document.getElementById('edit-attendance-id').value = record.id;
    document.getElementById('edit-attendance-class').value = record.class;
    document.getElementById('edit-attendance-date').value = record.date;
    
    // Set subject
    const subjectSelect = document.getElementById('edit-attendance-subject');
    if (subjectSelect) {
        for (let i = 0; i < subjectSelect.options.length; i++) {
            if (subjectSelect.options[i].value === record.subject) {
                subjectSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // Populate students table
    const tableBody = document.getElementById('edit-attendance-table-body');
    if (tableBody) {
        if (!record.students || record.students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No student data available</td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = record.students.map((student, index) => {
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${student.studentName}</td>
                        <td>${student.rollNo || '-'}</td>
                        <td>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input edit-status-radio" type="radio" name="edit-status-${student.studentId}" 
                                    id="edit-present-${student.studentId}" value="present" data-student-id="${student.studentId}" 
                                    ${student.status === 'present' ? 'checked' : ''}>
                                <label class="form-check-label" for="edit-present-${student.studentId}">Present</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input edit-status-radio" type="radio" name="edit-status-${student.studentId}" 
                                    id="edit-absent-${student.studentId}" value="absent" data-student-id="${student.studentId}"
                                    ${student.status === 'absent' ? 'checked' : ''}>
                                <label class="form-check-label" for="edit-absent-${student.studentId}">Absent</label>
                            </div>
                        </td>
                        <td>
                            <input type="text" class="form-control form-control-sm" id="edit-remarks-${student.studentId}" 
                                value="${student.remarks || ''}" placeholder="Add remarks">
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Setup event listeners for edit status changes
            const editStatusRadios = document.querySelectorAll('.edit-status-radio');
            editStatusRadios.forEach(radio => {
                radio.addEventListener('change', updateEditAttendanceCounters);
            });
            
            // Update edit counters
            updateEditAttendanceCounters();
        }
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editAttendanceModal'));
    modal.show();
}

/**
 * Update attendance record
 */
function updateAttendance() {
    const attendanceId = document.getElementById('edit-attendance-id')?.value || '';
    const attendanceClass = document.getElementById('edit-attendance-class')?.value || '';
    const attendanceDate = document.getElementById('edit-attendance-date')?.value || '';
    const attendanceSubject = document.getElementById('edit-attendance-subject')?.value || '';
    
    // Validate inputs
    if (!attendanceId || !attendanceClass || !attendanceDate || !attendanceSubject) {
        showAlert('Missing required information', 'warning');
        return;
    }
    
    // Get attendance records
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    // Find record by ID
    const recordIndex = attendanceRecords.findIndex(rec => rec.id === attendanceId);
    
    if (recordIndex === -1) {
        showAlert('Attendance record not found', 'danger');
        return;
    }
    
    // Get all student attendance data
    const attendanceData = [];
    const statusRadios = document.querySelectorAll('#edit-attendance-table-body .edit-status-radio:checked');
    
    statusRadios.forEach(radio => {
        const studentId = radio.dataset.studentId;
        const status = radio.value;
        const remarks = document.getElementById(`edit-remarks-${studentId}`)?.value || '';
        
        // Find student in original record
        const originalStudent = attendanceRecords[recordIndex].students.find(s => s.studentId === studentId);
        
        if (originalStudent) {
            attendanceData.push({
                ...originalStudent,
                status,
                remarks
            });
        }
    });
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Update record
    attendanceRecords[recordIndex] = {
        ...attendanceRecords[recordIndex],
        date: attendanceDate,
        subject: attendanceSubject,
        students: attendanceData,
        presentCount: document.getElementById('edit-present-count').textContent,
        absentCount: document.getElementById('edit-absent-count').textContent,
        totalCount: document.getElementById('edit-total-count').textContent,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser ? currentUser.id : 'admin'
    };
    
    // Save to localStorage
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    
    // Show success message
    showAlert('Attendance updated successfully', 'success');
    
    // Reload attendance records
    loadAttendanceRecords();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editAttendanceModal'));
    if (modal) {
        modal.hide();
    }
}

/**
 * Delete attendance record
 * @param {string} date - Attendance date
 * @param {string} classSection - Class name and section
 * @param {string} subject - Subject name
 */
function deleteAttendanceRecord(date, classSection, subject) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete attendance record for ${classSection} on ${date} (${subject})?`)) {
        return;
    }
    
    // Parse date string
    const dateParts = date.split(' ');
    const month = dateParts[0];
    const day = parseInt(dateParts[1].replace(',', ''));
    const year = parseInt(dateParts[2]);
    
    // Create date object
    const dateObj = new Date(`${month} ${day}, ${year}`);
    const isoDate = dateObj.toISOString().slice(0, 10);
    
    // Get attendance records
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    // Filter out the record to delete
    const filteredRecords = attendanceRecords.filter(rec => 
        !(rec.class === classSection && rec.date === isoDate && rec.subject === subject)
    );
    
    // Save to localStorage
    localStorage.setItem('attendanceRecords', JSON.stringify(filteredRecords));
    
    // Show success message
    showAlert('Attendance record deleted successfully', 'success');
    
    // Reload attendance records
    loadAttendanceRecords();
}

/**
 * Print attendance record
 */
function printAttendance() {
    const detailClass = document.getElementById('detail-class').textContent;
    const detailDate = document.getElementById('detail-date').textContent;
    const detailSubject = document.getElementById('detail-subject').textContent;
    const detailTeacher = document.getElementById('detail-teacher').textContent;
    const detailRate = document.getElementById('detail-rate').textContent;
    
    // Get attendance table
    const table = document.getElementById('detail-attendance-table-body');
    if (!table) {
        showAlert('No attendance data to print', 'warning');
        return;
    }
    
    // Create print content
    const printContent = document.getElementById('print-content');
    const printContainer = document.getElementById('print-container');
    
    if (printContent && printContainer) {
        printContent.innerHTML = `
            <div class="attendance-print">
                <div class="text-center mb-4">
                    <h3>Attendance Report</h3>
                </div>
                
                <div class="row mb-3">
                    <div class="col-4"><strong>Class:</strong> ${detailClass}</div>
                    <div class="col-4"><strong>Date:</strong> ${detailDate}</div>
                    <div class="col-4"><strong>Subject:</strong> ${detailSubject}</div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-4"><strong>Teacher:</strong> ${detailTeacher}</div>
                    <div class="col-4"><strong>Status:</strong> Completed</div>
                    <div class="col-4"><strong>Attendance Rate:</strong> ${detailRate}</div>
                </div>
                
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student Name</th>
                            <th>Roll No</th>
                            <th>Status</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${table.innerHTML}
                    </tbody>
                </table>
                
                <div class="row mt-5">
                    <div class="col-6 text-center">
                        <div style="border-top: 1px solid #333; padding-top: 10px; display: inline-block;">
                            Class Teacher Signature
                        </div>
                    </div>
                    <div class="col-6 text-center">
                        <div style="border-top: 1px solid #333; padding-top: 10px; display: inline-block;">
                            Principal Signature
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Trigger print
        printContainer.classList.remove('d-none');
        window.print();
        printContainer.classList.add('d-none');
    }
}

/**
 * Export attendance records
 */
function exportAttendance() {
    // Get filter values
    const filterClass = document.getElementById('filter-class')?.value || '';
    const filterDateFrom = document.getElementById('filter-date-from')?.value || '';
    const filterDateTo = document.getElementById('filter-date-to')?.value || '';
    
    // Get attendance records
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    
    // Filter records
    const filteredRecords = attendanceRecords.filter(record => {
        let matchesClass = true;
        let matchesDateRange = true;
        
        if (filterClass) {
            matchesClass = record.class === filterClass;
        }
        
        if (filterDateFrom) {
            matchesDateRange = record.date >= filterDateFrom;
        }
        
        if (filterDateTo) {
            matchesDateRange = matchesDateRange && record.date <= filterDateTo;
        }
        
        return matchesClass && matchesDateRange;
    });
    
    // If no records found
    if (filteredRecords.length === 0) {
        showAlert('No records to export', 'warning');
        return;
    }
    
    // Prepare data for CSV
    const csvData = [];
    
    // Add header row
    csvData.push(['Date', 'Class', 'Subject', 'Teacher', 'Present', 'Absent', 'Total', 'Percentage']);
    
    // Add record rows
    filteredRecords.forEach(record => {
        const date = new Date(record.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const present = parseInt(record.presentCount);
        const total = parseInt(record.totalCount);
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        csvData.push([
            date,
            record.class,
            record.subject,
            record.teacher || 'Admin',
            record.presentCount,
            record.absentCount,
            record.totalCount,
            `${percentage}%`
        ]);
    });
    
    // Download CSV
    downloadCSV(csvData, `attendance_${new Date().toISOString().slice(0, 10)}.csv`);
}