/**
 * School Management System
 * Admission Module Script
 */

import { GetSomething } from "../test.js";

/**
 * Initialize the single admission form
 */
function initSingleAdmission() {
    console.log('Initializing single admission form...');
    
    setupAdmissionForm();
    setupAdmissionEventListeners();
}

/**
 * Initialize the bulk admission page
 */
function initBulkAdmission() {
    console.log('Initializing bulk admission page...');
    
    setupBulkImportArea();
    setupBulkImportEventListeners();
}

/**
 * Setup the admission form with default values and field validations
 */
function setupAdmissionForm() {
    // Set default date values
    const dateOfBirthInput = document.getElementById('dateOfBirth');
    if (dateOfBirthInput) {
        // Set max date as today (can't have future birth dates)
        dateOfBirthInput.max = getTodayFormatted();
    }
    
    // Disable submit button if form is invalid
    const form = document.getElementById('admission-form');
    if (form) {
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', () => {
                validateAdmissionForm();
            });
        });
    }
}

/**
 * Setup event listeners for the admission form
 */
function setupAdmissionEventListeners() {
    const form = document.getElementById('admission-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate form
            const isValid = validateAdmissionForm();
            if (!isValid) {
                showAlert('Please fill all required fields correctly', 'warning');
                return;
            }
            
            // Collect form data
            const formData = new FormData(form);
            const studentData = {};
            
            // Convert FormData to object and format values
            for (const [key, value] of formData.entries()) {
                studentData[key] = value.trim();
            }
            
            // Add additional fields
            studentData.id = generateUniqueId();
            studentData.status = 'Active';
            studentData.admissionDate = getTodayFormatted();
            
            // Save student data
            saveStudent(studentData);
            
            // Show success message and reset form
            showAlert('Student admitted successfully!', 'success');
            form.reset();
        });
    }
}

/**
 * Validate the admission form
 * @returns {boolean} True if form is valid, false otherwise
 */
function validateAdmissionForm() {
    const form = document.getElementById('admission-form');
    if (!form) return false;
    
    // Add Bootstrap validation classes
    form.classList.add('was-validated');
    
    // Check validity using HTML5 validation API
    return form.checkValidity();
}

/**
 * Save student data to localStorage
 * @param {object} studentData - The student data to save
 */
function saveStudent(studentData) {
    // Get existing students
    const students = getAllStudents();
    
    // Check if roll number is already taken
    const rollNoExists = students.some(student => 
        student.rollNo === studentData.rollNo && 
        student.admissionClass === studentData.admissionClass
    );
    
    
    if (rollNoExists) {
        showAlert(`Roll number ${studentData.rollNo} is already assigned in class ${studentData.admissionClass}`, 'danger');
        return false;
    }
    
    // Add new student
    students.push(studentData);
    
    // Save to localStorage
    localStorage.setItem('students', JSON.stringify(students));

    console.log(JSON.stringify(studentData));

    GetSomething();
    
    return true;
}


/**
 * Setup the bulk import area
 */
function setupBulkImportArea() {
    // Setup drag and drop area
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    
    if (!dropZone || !fileInput) return;
    
    // Setup click to browse
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Setup file input change event
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

/**
 * Setup event listeners for bulk import functionality
 */
function setupBulkImportEventListeners() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const downloadTemplateBtn = document.getElementById('download-template');
    const removeFileBtn = document.getElementById('remove-file');
    const confirmImportBtn = document.getElementById('confirm-import');
    const cancelImportBtn = document.getElementById('cancel-import');
    const importMoreBtn = document.getElementById('import-more');
    const viewStudentsBtn = document.getElementById('view-students');
    
    if (!dropZone || !fileInput) return;
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt.files && dt.files.length > 0) {
            handleFileUpload(dt.files[0]);
        }
    }, false);
    
    // Event helper functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropZone.classList.add('highlight');
    }
    
    function unhighlight() {
        dropZone.classList.remove('highlight');
    }
    
    // Download template button
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadStudentTemplate();
        });
    }
    
    // Remove file button
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetBulkImport();
        });
    }
    
    // Confirm import button
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            importStudents();
        });
    }
    
    // Cancel import button
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetBulkImport();
        });
    }
    
    // Import more button
    if (importMoreBtn) {
        importMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetBulkImport();
        });
    }
    
    // View students button
    if (viewStudentsBtn) {
        viewStudentsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage('student-management');
        });
    }
}

/**
 * Handle the uploaded file
 * @param {File} file - The uploaded file
 */
function handleFileUpload(file) {
    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        showAlert('Please upload an Excel file (.xlsx or .xls)', 'danger');
        return;
    }
    
    // Show file info
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const processingIndicator = document.getElementById('processing-indicator');
    
    if (fileInfo && fileName && processingIndicator) {
        fileName.textContent = file.name;
        fileInfo.classList.remove('d-none');
        processingIndicator.classList.remove('d-none');
        
        // Process the file
        setTimeout(() => {
            // In a real app, we would use a library to parse the Excel file
            // For the prototype, we'll simulate file processing
            processExcelFile(file);
        }, 1000);
    }
}

/**
 * Reset the bulk import form
 */
function resetBulkImport() {
    // Clear file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Reset UI elements
    document.getElementById('file-info')?.classList.add('d-none');
    document.getElementById('processing-indicator')?.classList.add('d-none');
    document.getElementById('students-preview-section')?.classList.add('d-none');
    document.getElementById('import-results-section')?.classList.add('d-none');
}

/**
 * Download a template Excel file for student import
 */
function downloadStudentTemplate() {
    // In a real app, we would generate an Excel file for download
    // For the prototype, we'll show an alert
    showAlert('In a real app, this would download a template Excel file with the required columns', 'info');
}

/**
 * Process the uploaded Excel file
 * @param {File} file - The Excel file to process
 */
function processExcelFile(file) {
    // In a real app, we would use a library like SheetJS to parse the Excel file
    // For the prototype, we'll simulate processing with sample data
    
    const sampleData = [
        {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '2010-05-15',
            gender: 'Male',
            admissionClass: 'X',
            section: 'A',
            rollNo: '1001',
            mobileNumber: '9876543210',
            address: '123 Main St, City',
            fatherName: 'James Doe',
            parentMobile: '9876543211'
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '2011-07-20',
            gender: 'Female',
            admissionClass: 'IX',
            section: 'B',
            rollNo: '901',
            mobileNumber: '9876543220',
            address: '456 Oak St, Town',
            fatherName: 'Michael Smith',
            parentMobile: '9876543221'
        },
        {
            firstName: 'Robert',
            lastName: 'Johnson',
            dateOfBirth: '2009-03-10',
            gender: 'Male',
            admissionClass: 'XI',
            section: 'C',
            rollNo: '1101',
            mobileNumber: '9876543230',
            address: '789 Pine St, Village',
            fatherName: 'William Johnson',
            parentMobile: '9876543231'
        }
    ];
   
    
    
    // Simulate processing delay
    setTimeout(() => {
        // Hide processing indicator
        const processingIndicator = document.getElementById('processing-indicator');
        if (processingIndicator) {
            processingIndicator.classList.add('d-none');
        }
        
        // Update student count
        const studentCount = document.getElementById('student-count');
        if (studentCount) {
            studentCount.textContent = `${sampleData.length} students`;
        }
        
        // Show student preview
        showStudentPreview(sampleData);
    }, 1500);
}

/**
 * Show a preview of the students to be imported
 * @param {Array} students - Array of student objects
 */
function showStudentPreview(students) {
    const previewSection = document.getElementById('students-preview-section');
    const previewBody = document.getElementById('students-preview-body');
    
    if (!previewSection || !previewBody) return;
    
    // Generate preview rows
    const previewRows = students.map((student, index) => {
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${formatDate(student.dateOfBirth)}</td>
                <td>${student.gender}</td>
                <td>${student.admissionClass}-${student.section}</td>
                <td>${student.rollNo}</td>
                <td>${student.mobileNumber}</td>
            </tr>
        `;
    }).join('');
    
    // Update preview body
    previewBody.innerHTML = previewRows;
    
    // Show preview section
    previewSection.classList.remove('d-none');
    
    // Save students data to session storage for import
    sessionStorage.setItem('importStudents', JSON.stringify(students));
    
    
}

/**
 * Import students from the preview
 */
function importStudents() {
    // Get students data from session storage
    const studentsToImport = JSON.parse(sessionStorage.getItem('importStudents') || '[]');
    
    if (studentsToImport.length === 0) {
        showAlert('No students to import', 'warning');
        return;
    }
    
    // Get existing students
    const existingStudents = getAllStudents();
    
    // Process each student
    let importedCount = 0;
    let duplicateCount = 0;
    
    studentsToImport.forEach(student => {
        // Check if roll number is already taken
        const isDuplicate = existingStudents.some(existing => 
            existing.rollNo === student.rollNo && 
            existing.admissionClass === student.admissionClass
        );
        
        if (!isDuplicate) {
            // Add additional fields
            student.id = generateUniqueId();
            student.status = 'Active';
            student.admissionDate = getTodayFormatted();
            
            // Add to existing students
            existingStudents.push(student);
            importedCount++;
        } else {
            duplicateCount++;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('students', JSON.stringify(existingStudents));
    
    // Hide preview section
    document.getElementById('students-preview-section')?.classList.add('d-none');
    
    // Show results section
    const resultsSection = document.getElementById('import-results-section');
    const successMessage = document.getElementById('success-message');
    
    if (resultsSection && successMessage) {
        resultsSection.classList.remove('d-none');
        
        if (duplicateCount > 0) {
            successMessage.textContent = `Successfully imported ${importedCount} students. ${duplicateCount} students skipped due to duplicate roll numbers.`;
        } else {
            successMessage.textContent = `Successfully imported ${importedCount} students.`;
        }
    }
    
    // Clear import data
    sessionStorage.removeItem('importStudents');
}

/**
 * Format an Excel date (if it's a number) to YYYY-MM-DD
 * @param {*} dateValue - The date value from Excel
 * @returns {string} Formatted date string
 */
function formatExcelDate(dateValue) {
    if (!dateValue) return '';
    
    // Check if it's a number (Excel stores dates as days since Dec 30, 1899)
    if (typeof dateValue === 'number') {
        const date = new Date((dateValue - 25569) * 86400 * 1000);
        return date.toISOString().slice(0, 10);
    }
    
    // If it's already a string, try to format it
    return dateValue;
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function today() {
    return getTodayFormatted();
}