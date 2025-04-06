/**
 * School Management System
 * Student Management Module Script
 */

/**
 * Initialize the student management page
 */
async function initStudentManagement() {
    console.log('Initializing student management...');
    
    // Setup search functionality
    setupSearchFunctionality();
    
    // Load all students initially
    try {
        const students = await getAllStudents(); // Wait for the promise to resolve
        displayStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
        displayStudents([]); // Display empty state on error
    }
    
    // Setup action buttons
    setupStudentActionButtons();
}

/**
 * Initialize the student management page
 */
function initParentManagement() {
    console.log('Initializing student management...');
    
    // Setup search functionality
    setupSearchFunctionality();
    
    // Load all students initially
    displayStudents(getAllStudents());
    
    // Setup action buttons
    setupStudentActionButtons();
}

/**
 * Setup search functionality for student management
 */
function setupSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    const searchType = document.getElementById('search-type');
    const filterClass = document.getElementById('filter-class');
    const resetSearchButton = document.getElementById('reset-search');
    
    // Search button click
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch();
        });
    }
    
    // Search on Enter key
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Class filter change
    if (filterClass) {
        filterClass.addEventListener('change', () => {
            performSearch();
        });
    }
    
    // Reset search
    if (resetSearchButton) {
        resetSearchButton.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterClass) filterClass.value = '';
            displayStudents(getAllStudents());
        });
    }
    
    // Helper function to perform search
    async function performSearch() {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.trim();
        const type = searchType ? searchType.value : 'name';
        const classFilter = filterClass ? filterClass.value : '';
        
        try {
            // Get all students
            let students = await getAllStudents(); // Wait for the promise to resolve
            
            // Apply class filter
            if (classFilter) {
                students = students.filter(student => student.admissionClass === classFilter);
            }
            
            // Apply search if search term is not empty
            if (searchTerm) {
                students = searchStudents(searchTerm, type, students);
            }
            
            // Display filtered students
            displayStudents(students);
        } catch (error) {
            console.error('Error performing search:', error);
            displayStudents([]); // Display empty state on error
        }
    }
}

/**
 * Search students based on search term and type
 * @param {string} searchTerm - The search term
 * @param {string} searchType - Type of search (name, roll, mobile)
 * @param {Array} students - Array of students to search within (optional)
 * @returns {Array} - Matching students
 */
function searchStudents(searchTerm, searchType, students = null) {
    // Get students if not provided
    if (!students) {
        students = getAllStudents();
    }
    
    // Perform search based on type
    return students.filter(student => {
        switch (searchType) {
            case 'name':
                const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
                
            case 'roll':
                return student.rollNo && student.rollNo.toString().includes(searchTerm);
                
            case 'mobile':
                return (student.mobileNumber && student.mobileNumber.includes(searchTerm)) || 
                       (student.parentMobile && student.parentMobile.includes(searchTerm));
                
            default:
                return false;
        }
    });
}

/**
 * Display students in the student table
 * @param {Array} students - Array of student objects
 */
function displayStudents(students) {
    const tableBody = document.getElementById('students-table-body');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');

    if (!tableBody) return;

    // Debugging: Log students data
    console.log('Displaying students:', students);

    // Ensure students is an array
    students = Array.isArray(students) ? students : [];

    // Show loading state
    if (loadingState) {
        loadingState.classList.remove('d-none');
    }
    tableBody.classList.add('d-none');
    emptyState.classList.add('d-none');

    // Simulate loading delay
    setTimeout(() => {
        // Hide loading state
        loadingState.classList.add('d-none');

        // Check if students exist
        if (students.length === 0) {
            emptyState.classList.remove('d-none');
            tableBody.innerHTML = '';
            tableBody.classList.add('d-none');
            return;
        }

        // Generate table rows
        const rows = students.map(student => {
            if (!student || typeof student !== 'object') return ''; // Skip invalid entries

            const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
            const classSection = `${student.admissionClass || ''}-${student.section || ''}`;

            let statusBadge = '';
            if (student.status === 'Active') {
                statusBadge = '<span class="badge bg-success">Active</span>';
            } else if (student.status === 'Inactive') {
                statusBadge = '<span class="badge bg-danger">Inactive</span>';
            } else if (student.status === 'Pending') {
                statusBadge = '<span class="badge bg-warning">Pending</span>';
            } else {
                statusBadge = `<span class="badge bg-secondary">${student.status || 'Unknown'}</span>`;
            }

            return `
                <tr data-student-id="${student.id}">
                    <td>${student.id || ''}</td>
                    <td>${fullName}</td>
                    <td>${classSection}</td>
                    <td>${student.rollNo || ''}</td>
                    <td>${student.mobileNumber || ''}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-info btn-action view-student" data-bs-toggle="tooltip" title="View Profile">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button type="button" class="btn btn-outline-primary btn-action edit-student" data-bs-toggle="tooltip" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-action delete-student" data-bs-toggle="tooltip" title="Delete">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Update table body
        tableBody.innerHTML = rows;
        tableBody.classList.remove('d-none');

        // Initialize tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }, 500); // Simulate loading for 500ms
}

/**
 * Setup event listeners for student action buttons
 */
function setupStudentActionButtons() {
    // Use event delegation for action buttons
    const tableBody = document.getElementById('students-table-body');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const row = target.closest('tr');
            const studentId = row ? row.dataset.studentId : null;
            
            if (!studentId) return;
            
            // View student
            if (target.classList.contains('view-student')) {
                viewStudentProfile(studentId);
            }
            
            // Edit student
            if (target.classList.contains('edit-student')) {
                editStudent(studentId);
            }
            
            // Delete student
            if (target.classList.contains('delete-student')) {
                // Show confirmation modal
                const student = getStudentById(studentId);
                if (student) {
                    const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
                    const deleteStudentName = document.getElementById('delete-student-name');
                    const deleteStudentId = document.getElementById('delete-student-id');
                    
                    if (deleteStudentName) {
                        deleteStudentName.textContent = fullName;
                    }
                    
                    if (deleteStudentId) {
                        deleteStudentId.value = studentId;
                    }
                    
                    // Show modal
                    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
                    confirmDeleteModal.show();
                }
            }
        });
    }
    
    // Add new student button
    const addStudentBtn = document.getElementById('add-student');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            // Navigate to admission form
            loadPage('admission-single');
        });
    }

    const addBulkStudentBtn = document.getElementById('bulk-add-student');
    if(addBulkStudentBtn)
    {
        addBulkStudentBtn.addEventListener('click', () => {
            loadPage('admission-bulk');
        })
    }
    
    // Export students button 
    const exportStudentsBtn = document.getElementById('export-students');
    if (exportStudentsBtn) {
        exportStudentsBtn.addEventListener('click', () => {
            const students = getAllStudents();
            if (students.length === 0) {
                showAlert('No students to export', 'warning');
                return;
            }
            
            downloadCSV(students, 'students_export.csv');
        });
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirm-delete-student');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            const studentId = document.getElementById('delete-student-id')?.value;
            if (studentId) {
                deleteStudent(studentId);
                
                // Hide modal
                bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
            }
        });
    }
    
    // Print ID card button in student profile
    const printIdCardBtn = document.getElementById('print-id-card');
    if (printIdCardBtn) {
        printIdCardBtn.addEventListener('click', () => {
            const studentId = printIdCardBtn.closest('.modal')?.dataset.studentId;
            if (studentId) {
                printIdCard(studentId);
            }
        });
    }
    
    // Print profile button in student profile
    const printProfileBtn = document.getElementById('print-profile');
    if (printProfileBtn) {
        printProfileBtn.addEventListener('click', () => {
            const studentId = printProfileBtn.closest('.modal')?.dataset.studentId;
            if (studentId) {
                printStudentProfile(studentId);
            }
        });
    }
    
    // Edit button in student profile
    const editStudentBtn = document.getElementById('edit-student');
    if (editStudentBtn) {
        editStudentBtn.addEventListener('click', () => {
            const studentId = editStudentBtn.closest('.modal')?.dataset.studentId;
            if (studentId) {
                // Hide student profile modal
                bootstrap.Modal.getInstance(document.getElementById('studentProfileModal')).hide();
                
                // Open edit modal
                editStudent(studentId);
            }
        });
    }
    
    // Save edit student button
    const saveEditStudentBtn = document.getElementById('save-edit-student');
    if (saveEditStudentBtn) {
        saveEditStudentBtn.addEventListener('click', () => {
            saveEditedStudent();
        });
    }
}

/**
 * Show student profile in a modal
 * @param {string} studentId - The student ID
 */
async function viewStudentProfile(studentId) {
    const student = await getStudentById(studentId); // Await the promise to resolve
    if (!student) {
        showAlert('Student not found', 'danger');
        return;
    }
    
    // Get the modal
    const modal = document.getElementById('studentProfileModal');
    if (!modal) return;
    
    // Set student ID to modal
    modal.dataset.studentId = studentId;
    
    // Update modal content
    const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
    const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
    
    // Set student info
    document.getElementById('student-name').textContent = fullName;
    document.getElementById('student-class-section').textContent = `Class ${classSection}`;
    
    // Set status badge
    const statusBadge = document.getElementById('student-status');
    if (statusBadge) {
        statusBadge.className = 'badge';
        if (student.status === 'Active') {
            statusBadge.classList.add('bg-success');
            statusBadge.textContent = 'Active';
        } else if (student.status === 'Inactive') {
            statusBadge.classList.add('bg-danger');
            statusBadge.textContent = 'Inactive';
        } else if (student.status === 'Pending') {
            statusBadge.classList.add('bg-warning');
            statusBadge.textContent = 'Pending';
        } else {
            statusBadge.classList.add('bg-secondary');
            statusBadge.textContent = student.status || 'Unknown';
        }
    }
    
    // Set personal info
    document.getElementById('profile-roll').textContent = student.rollNo || '';
    document.getElementById('profile-dob').textContent = formatDate(student.dateOfBirth) || '';
    document.getElementById('profile-gender').textContent = student.gender || '';
    document.getElementById('profile-blood').textContent = student.bloodGroup || '';
    
    // Set contact info
    const addressText = [
        student.address || '',
        student.city || '',
        student.pinCode || ''
    ].filter(Boolean).join(', ');
    
    document.getElementById('profile-address').textContent = addressText || '';
    document.getElementById('profile-mobile').textContent = student.mobileNumber || '';
    document.getElementById('profile-email').textContent = student.email || '';
    
    // Set parent info
    document.getElementById('profile-father').textContent = student.fatherName || '';
    document.getElementById('profile-mother').textContent = student.motherName || '';
    document.getElementById('profile-parent-mobile').textContent = student.parentMobile || '';
    
    // Show modal
    const profileModal = new bootstrap.Modal(modal);
    profileModal.show();
}

/**
 * Edit student information
 * @param {string} studentId - The student ID
 */
function editStudent(studentId) {
    const student = getStudentById(studentId);
    if (!student) {
        showAlert('Student not found', 'danger');
        return;
    }

    // Get edit modal
    const modal = document.getElementById('editStudentModal');
    if (!modal) return;

    // Set student ID to hidden field
    document.getElementById('edit-student-id').value = studentId;

    // Set form values
    document.getElementById('edit-firstName').value = student.firstName || '';
    document.getElementById('edit-middleName').value = student.middleName || '';
    document.getElementById('edit-lastName').value = student.lastName || '';
    document.getElementById('edit-dateOfBirth').value = student.dateOfBirth || '';
    document.getElementById('edit-gender').value = student.gender || '';
    document.getElementById('edit-bloodGroup').value = student.bloodGroup || '';
    document.getElementById('edit-admissionClass').value = student.admissionClass || '';
    document.getElementById('edit-section').value = student.section || '';
    document.getElementById('edit-rollNo').value = student.rollNo || '';
    document.getElementById('edit-address').value = student.address || '';
    document.getElementById('edit-city').value = student.city || '';
    document.getElementById('edit-pinCode').value = student.pinCode || '';
    document.getElementById('edit-whatsAppNumber').value = student.mobileNumber || '';
    document.getElementById('edit-fatherName').value = student.fatherName || '';
    document.getElementById('edit-motherName').value = student.motherName || '';
    document.getElementById('edit-guardianName').value = student.guardianName || '';

    // Show modal
    const editModal = new bootstrap.Modal(modal);
    editModal.show();
}

/**
 * Save edited student data
 */
function saveEditedStudent() {
    // Get form
    const form = document.getElementById('edit-student-form');
    if (!form) return;
    
    // Validate form
    const isValid = validateEditForm();
    if (!isValid) {
        showAlert('Please fill all required fields correctly', 'warning');
        return;
    }
    
    // Get student ID
    const studentId = document.getElementById('edit-student-id').value;
    if (!studentId) {
        showAlert('Student ID is missing', 'danger');
        return;
    }
    
    // Get existing student
    const existingStudent = getStudentById(studentId);
    if (!existingStudent) {
        showAlert('Student not found', 'danger');
        return;
    }
    
    // Collect form data
    const formData = new FormData(form);
    const updatedStudent = { ...existingStudent };
    
    // Update student properties
    for (const [key, value] of formData.entries()) {
        updatedStudent[key] = value.trim();
    }
    
    // Check if roll number is already taken by another student
    const students = getAllStudents();
    const rollNoExists = students.some(student => 
        student.id !== studentId && 
        student.rollNo === updatedStudent.rollNo && 
        student.admissionClass === updatedStudent.admissionClass
    );
    
    if (rollNoExists) {
        showAlert(`Roll number ${updatedStudent.rollNo} is already assigned in class ${updatedStudent.admissionClass}`, 'danger');
        return;
    }
    
    // Update student
    const success = updateStudent(updatedStudent);
    
    if (success) {
        // Hide modal
        bootstrap.Modal.getInstance(document.getElementById('editStudentModal')).hide();
        
        // Show success message
        showAlert('Student information updated successfully', 'success');
        
        // Refresh student list
        displayStudents(getAllStudents());
    } else {
        showAlert('Failed to update student information', 'danger');
    }
}

/**
 * Validate edit form
 * @returns {boolean} True if form is valid
 */
function validateEditForm() {
    const form = document.getElementById('edit-student-form');
    if (!form) return false;
    
    // Add Bootstrap validation classes
    form.classList.add('was-validated');
    
    // Check validity using HTML5 validation API
    return form.checkValidity();
}

/**
 * Print student ID card
 * @param {string} studentId - The student ID
 */
function printIdCard(studentId) {
    const student = getStudentById(studentId);
    if (!student) {
        showAlert('Student not found', 'danger');
        return;
    }
    
    // Create print container
    const printContainer = document.getElementById('print-container');
    const printContent = document.getElementById('print-content');
    
    if (!printContainer || !printContent) return;
    
    // Generate ID card HTML
    const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
    const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
    
    // Load ID card template
    fetch('../static/images/templates/id_card_template.svg')
        .then(response => response.text())
        .then(svgText => {
            // Create ID card HTML
            const idCardHtml = `
                <div class="id-card-container" style="width: 400px; margin: 0 auto;">
                    <div class="id-card-preview">
                        ${svgText.replace(/id="student-name"/g, `id="student-name" data-value="${fullName}"`)
                                 .replace(/id="student-class"/g, `id="student-class" data-value="${classSection}"`)
                                 .replace(/id="student-roll"/g, `id="student-roll" data-value="${student.rollNo || ''}"`)
                                 .replace(/id="student-dob"/g, `id="student-dob" data-value="${formatDate(student.dateOfBirth) || ''}"`)
                                 .replace(/id="valid-till"/g, `id="valid-till" data-value="${formatDate(new Date(new Date().getFullYear() + 1, 2, 31))}"`)
                                 }
                    </div>
                </div>
            `;
            
            // Set print content
            printContent.innerHTML = idCardHtml;
            
            // Get all ID elements
            const idElements = printContent.querySelectorAll('[id][data-value]');
            
            // Replace text content
            idElements.forEach(element => {
                element.textContent = element.dataset.value;
            });
            
            // Show print container and trigger print
            printContainer.classList.remove('d-none');
            window.print();
            printContainer.classList.add('d-none');
            
        })
        .catch(error => {
            console.error('Error loading ID card template:', error);
            showAlert('Failed to load ID card template', 'danger');
        });
}

/**
 * Print student profile
 * @param {string} studentId - The student ID
 */
function printStudentProfile(studentId) {
    const student = getStudentById(studentId);
    if (!student) {
        showAlert('Student not found', 'danger');
        return;
    }
    
    // Create print container
    const printContainer = document.getElementById('print-container');
    const printContent = document.getElementById('print-content');
    
    if (!printContainer || !printContent) return;
    
    // Generate profile HTML
    const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
    const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
    const addressText = [
        student.address || '',
        student.city || '',
        student.pinCode || ''
    ].filter(Boolean).join(', ');
    
    const profileHtml = `
        <div class="student-profile-print" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div class="header" style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #333;">Student Profile</h2>
                <h3 style="margin: 5px 0; color: #666;">School Name</h3>
            </div>
            
            <div class="profile-content" style="display: flex; margin-bottom: 20px;">
                <div class="profile-image" style="flex: 1; text-align: center;">
                    <div style="width: 150px; height: 180px; border: 1px solid #ddd; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #999;">Photo</span>
                    </div>
                    <h4 style="margin: 10px 0;">${fullName}</h4>
                    <p style="margin: 5px 0; color: #666;">Class: ${classSection}</p>
                    <p style="margin: 5px 0; color: #666;">Roll No: ${student.rollNo || ''}</p>
                </div>
                
                <div class="profile-details" style="flex: 2; padding-left: 20px;">
                    <div class="section" style="margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Personal Information</h4>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Date of Birth:</div>
                            <div style="flex: 2;">${formatDate(student.dateOfBirth) || ''}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Gender:</div>
                            <div style="flex: 2;">${student.gender || ''}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Blood Group:</div>
                            <div style="flex: 2;">${student.bloodGroup || ''}</div>
                        </div>
                    </div>
                    
                    <div class="section" style="margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Contact Information</h4>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Address:</div>
                            <div style="flex: 2;">${addressText}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Mobile:</div>
                            <div style="flex: 2;">${student.mobileNumber || ''}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Email:</div>
                            <div style="flex: 2;">${student.email || ''}</div>
                        </div>
                    </div>
                    
                    <div class="section" style="margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Parent Information</h4>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Father's Name:</div>
                            <div style="flex: 2;">${student.fatherName || ''}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Mother's Name:</div>
                            <div style="flex: 2;">${student.motherName || ''}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 5px;">
                            <div style="flex: 1; font-weight: bold;">Contact Number:</div>
                            <div style="flex: 2;">${student.parentMobile || ''}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer" style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; text-align: center; font-size: 12px; color: #666;">
                <p>This document is for official use only. Printed on ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    // Set print content
    printContent.innerHTML = profileHtml;
    
    // Show print container and trigger print
    printContainer.classList.remove('d-none');
    window.print();
    printContainer.classList.add('d-none');
}

/**
 * Delete a student
 * @param {string} studentId - The student ID
 */
function deleteStudent(studentId) {
    // Remove student
    const success = removeStudent(studentId);
    
    if (success) {
        // Show success message
        showAlert('Student deleted successfully', 'success');
        
        // Refresh student list
        displayStudents(getAllStudents());
    } else {
        showAlert('Failed to delete student', 'danger');
    }
}

/**
 * Method to populate fees section in the edit modal
 */
function populateFeesSection(feesData) {
    document.getElementById('edit-feeType').value = feesData.feeType || 'Regular';
    document.getElementById('edit-scholarshipAmount').value = feesData.scholarshipAmount || '';
    document.getElementById('edit-scholarshipAmount').disabled = feesData.feeType !== 'Scholarship';
    document.getElementById('edit-addmissionFees').value = feesData.addmissionFees || '';
    document.getElementById('edit-monthelyFees').value = feesData.monthelyFees || '';
    document.getElementById('edit-busServices').value = feesData.busServices || '';
}