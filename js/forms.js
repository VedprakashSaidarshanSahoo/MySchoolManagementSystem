/**
 * School Management System
 * Forms Module Script
 */

/**
 * Initialize the print forms page
 */
function initPrintForms() {
    console.log('Initializing print forms...');
    
    // Setup form functionality
    setupPrintForms();
    
    // Setup event listeners
    setupPrintFormsEventListeners();
}

/**
 * Setup the print forms functionality
 */
function setupPrintForms() {
    // Load students for selection
    displayStudentsForBulkPrint(getAllStudents());
    
    // Setup form type selection highlighting
    const formTypeInputs = document.querySelectorAll('input[name="form-type"]');
    if (formTypeInputs) {
        formTypeInputs.forEach(input => {
            input.addEventListener('change', () => {
                // Update UI based on selected form type
                updateFormTypeUI();
                
                // Reset selection count
                updateSelectionCount();
            });
        });
    }
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });
}

/**
 * Update UI based on selected form type
 */
function updateFormTypeUI() {
    const selectedType = document.querySelector('input[name="form-type"]:checked')?.value || 'admission';
    
    // You can add specific UI updates based on the selected form type
    // For example, showing different filter options for different form types
    console.log(`Selected form type: ${selectedType}`);
}

/**
 * Setup event listeners for the print forms page
 */
function setupPrintFormsEventListeners() {
    // Filter change event
    const filterClass = document.getElementById('filter-class');
    const filterSection = document.getElementById('filter-section');
    
    if (filterClass) {
        filterClass.addEventListener('change', filterStudents);
    }
    
    if (filterSection) {
        filterSection.addEventListener('change', filterStudents);
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-student');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filterStudents();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', filterStudents);
    }
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (filterClass) filterClass.value = '';
            if (filterSection) filterSection.value = '';
            if (searchInput) searchInput.value = '';
            
            displayStudentsForBulkPrint(getAllStudents());
        });
    }
    
    // Select all students checkbox
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            const isChecked = selectAllCheckbox.checked;
            const checkboxes = document.querySelectorAll('#students-table-body input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            
            updateSelectionCount();
        });
    }
    
    // Select all button
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('#students-table-body input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = true;
            }
            
            updateSelectionCount();
        });
    }
    
    // Clear selection button
    const clearSelectionBtn = document.getElementById('clear-selection-btn');
    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('#students-table-body input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
            
            updateSelectionCount();
        });
    }
    
    // Print selected button
    const printSelectedBtn = document.getElementById('print-selected-btn');
    if (printSelectedBtn) {
        printSelectedBtn.addEventListener('click', () => {
            const selectedStudentIds = getSelectedStudentsForBulkPrint();
            
            if (selectedStudentIds.length === 0) {
                showAlert('Please select at least one student', 'warning');
                return;
            }
            
            // Get selected form type
            const formType = document.querySelector('input[name="form-type"]:checked')?.value || 'admission';
            
            // Handle different form types
            switch (formType) {
                case 'birthday-card':
                    // Show birthday card template selection modal
                    const birthdayCardModal = new bootstrap.Modal(document.getElementById('birthdayCardModal'));
                    birthdayCardModal.show();
                    
                    // Set up confirm button
                    const confirmBirthdayCardBtn = document.getElementById('confirm-birthday-card');
                    if (confirmBirthdayCardBtn) {
                        confirmBirthdayCardBtn.onclick = () => {
                            const template = document.querySelector('input[name="birthday-template"]:checked')?.value || 'template-1';
                            const message = document.getElementById('birthday-message')?.value || '';
                            
                            printBulkBirthdayCards(selectedStudentIds, template, message);
                            birthdayCardModal.hide();
                        };
                    }
                    break;
                    
                case 'id-card':
                    printBulkIdCards(selectedStudentIds);
                    break;
                    
                case 'admission':
                default:
                    printBulkAdmissionForms(selectedStudentIds);
                    break;
            }
        });
    }
    
    // Event delegation for preview buttons
    document.addEventListener('click', (e) => {
        const previewBtn = e.target.closest('button.preview-btn');
        if (!previewBtn) return;
        
        const studentId = previewBtn.dataset.studentId;
        if (!studentId) return;
        
        // Get form type
        const formType = document.querySelector('input[name="form-type"]:checked')?.value || 'admission';
        
        // Show preview based on form type
        const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
        const previewContent = document.getElementById('preview-content');
        const previewModalLabel = document.getElementById('previewModalLabel');
        
        if (previewContent && previewModalLabel) {
            // Set modal title based on form type
            previewModalLabel.textContent = `${formType.charAt(0).toUpperCase() + formType.slice(1)} Form Preview`;
            
            // Show loading indicator
            previewContent.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading preview...</p>
                </div>
            `;
            
            previewModal.show();
            
            // Load content based on form type
            switch (formType) {
                case 'id-card':
                    // Load ID card preview
                    setTimeout(() => {
                        generateIdCardPreview(studentId, previewContent);
                    }, 500);
                    break;
                    
                case 'birthday-card':
                    // Load birthday card preview
                    setTimeout(() => {
                        generateBirthdayCardPreview(studentId, previewContent);
                    }, 500);
                    break;
                    
                case 'admission':
                default:
                    // Load admission form preview
                    setTimeout(() => {
                        generateAdmissionFormPreview(studentId, previewContent);
                    }, 500);
                    break;
            }
            
            // Setup print single button
            const printSingleBtn = document.getElementById('print-single-btn');
            if (printSingleBtn) {
                printSingleBtn.onclick = () => {
                    switch (formType) {
                        case 'id-card':
                            printIdCard(studentId);
                            break;
                            
                        case 'birthday-card':
                            // Get default template
                            const template = 'template-1';
                            const message = '';
                            printBirthdayCard(studentId, template, message);
                            break;
                            
                        case 'admission':
                        default:
                            printAdmissionForm(studentId);
                            break;
                    }
                };
            }
        }
    });
}

/**
 * Filter students based on class, section, and search query
 */
function filterStudents() {
    const filterClass = document.getElementById('filter-class')?.value || '';
    const filterSection = document.getElementById('filter-section')?.value || '';
    const searchTerm = document.getElementById('search-student')?.value.trim() || '';
    
    // Get all students
    let filteredStudents = getAllStudents();
    
    // Apply class filter
    if (filterClass) {
        filteredStudents = filteredStudents.filter(student => student.admissionClass === filterClass);
    }
    
    // Apply section filter
    if (filterSection) {
        filteredStudents = filteredStudents.filter(student => student.section === filterSection);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student => {
            const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.toLowerCase();
            const rollNo = student.rollNo?.toString() || '';
            
            return fullName.includes(searchTerm.toLowerCase()) || rollNo.includes(searchTerm);
        });
    }
    
    // Display filtered students
    displayStudentsForBulkPrint(filteredStudents);
}

/**
 * Display students for bulk print selection
 * @param {Array} students - Array of student objects
 */
function displayStudentsForBulkPrint(students) {
    const tableBody = document.getElementById('students-table-body');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    
    if (!tableBody) return;
    
    // Show loading state
    if (loadingState) {
        loadingState.classList.remove('d-none');
    }
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    if (emptyState) {
        emptyState.classList.add('d-none');
    }
    
    // Simulate loading delay
    setTimeout(() => {
        // Hide loading state
        if (loadingState) {
            loadingState.classList.add('d-none');
        }
        
        // Check if students exist
        if (!students || students.length === 0) {
            if (emptyState) {
                emptyState.classList.remove('d-none');
            }
            return;
        }
        
        // Generate table rows
        const rows = students.map(student => {
            const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
            const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
            
            return `
                <tr>
                    <td>
                        <div class="form-check">
                            <input class="form-check-input student-checkbox" type="checkbox" data-student-id="${student.id}" onchange="updateSelectionCount()">
                        </div>
                    </td>
                    <td>${fullName}</td>
                    <td>${classSection}</td>
                    <td>${student.rollNo || ''}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-info preview-btn" data-student-id="${student.id}" data-bs-toggle="tooltip" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update table body
        tableBody.innerHTML = rows;
        
        // Initialize tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
        
        // Reset selection count
        updateSelectionCount();
        
    }, 500); // Simulate loading for 500ms
}

/**
 * Update the selection count and button state
 */
function updateSelectionCount() {
    const selectedCount = document.getElementById('selected-count');
    const printSelectedBtn = document.getElementById('print-selected-btn');
    
    const checkboxes = document.querySelectorAll('#students-table-body input[type="checkbox"]');
    const checkedCount = [...checkboxes].filter(cb => cb.checked).length;
    
    if (selectedCount) {
        selectedCount.textContent = `${checkedCount} students selected`;
    }
    
    if (printSelectedBtn) {
        printSelectedBtn.disabled = checkedCount === 0;
    }
}

/**
 * Get selected students for bulk print
 * @returns {Array} Array of selected student IDs
 */
function getSelectedStudentsForBulkPrint() {
    const checkboxes = document.querySelectorAll('#students-table-body input[type="checkbox"]:checked');
    return [...checkboxes].map(cb => cb.dataset.studentId);
}

/**
 * Print a single student's admission form
 * @param {string} studentId - The student ID
 */
function printAdmissionForm(studentId) {
    const student = getStudentById(studentId);
    if (!student) {
        showAlert('Student not found', 'danger');
        return;
    }
    
    // Create print container
    const printContainer = document.getElementById('print-container');
    const printContent = document.getElementById('print-content');
    
    if (!printContainer || !printContent) return;
    
    // Set print content
    printContent.innerHTML = generateAdmissionFormHtml(student);
    
    // Show print container and trigger print
    printContainer.classList.remove('d-none');
    window.print();
    printContainer.classList.add('d-none');
}

/**
 * Print bulk admission forms
 * @param {Array} studentIds - Array of student IDs to print forms for
 */
function printBulkAdmissionForms(studentIds) {
    // Get students from IDs
    const students = studentIds.map(id => getStudentById(id)).filter(Boolean);
    
    if (students.length === 0) {
        showAlert('No valid students found', 'danger');
        return;
    }
    
    // Create print container
    const printContainer = document.getElementById('print-container');
    const printContent = document.getElementById('print-content');
    
    if (!printContainer || !printContent) return;
    
    // Generate HTML for all admission forms
    const formsHtml = students.map(student => {
        return `
            <div class="admission-form-container" style="page-break-after: always;">
                ${generateAdmissionFormHtml(student)}
            </div>
        `;
    }).join('');
    
    // Set print content
    printContent.innerHTML = formsHtml;
    
    // Show print container and trigger print
    printContainer.classList.remove('d-none');
    window.print();
    printContainer.classList.add('d-none');
    
    // Show success message
    showAlert(`Printed ${students.length} admission forms`, 'success');
}

/**
 * Print bulk ID cards
 * @param {Array} studentIds - Array of student IDs to print ID cards for
 */
function printBulkIdCards(studentIds) {
    // Get students from IDs
    const students = studentIds.map(id => getStudentById(id)).filter(Boolean);
    
    if (students.length === 0) {
        showAlert('No valid students found', 'danger');
        return;
    }
    
    // Create print container
    const printContainer = document.getElementById('print-container');
    const printContent = document.getElementById('print-content');
    
    if (!printContainer || !printContent) return;
    
    // Load ID card template
    fetch('../static/images/templates/id_card_template.svg')
        .then(response => response.text())
        .then(svgText => {
            // Generate HTML for all ID cards
            const cardsHtml = students.map(student => {
                const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
                const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
                
                // Create modified SVG with student data
                let modifiedSvg = svgText;
                modifiedSvg = modifiedSvg.replace(/id="student-name"[^>]*>Student Name<\/text>/g, `id="student-name">${fullName}</text>`);
                modifiedSvg = modifiedSvg.replace(/id="student-class"[^>]*>X-A<\/text>/g, `id="student-class">${classSection}</text>`);
                modifiedSvg = modifiedSvg.replace(/id="student-roll"[^>]*>1001<\/text>/g, `id="student-roll">${student.rollNo || ''}</text>`);
                modifiedSvg = modifiedSvg.replace(/id="student-dob"[^>]*>01-01-2010<\/text>/g, `id="student-dob">${formatDate(student.dateOfBirth) || ''}</text>`);
                modifiedSvg = modifiedSvg.replace(/id="valid-till"[^>]*>31-12-2023<\/text>/g, `id="valid-till">${formatDate(new Date(new Date().getFullYear() + 1, 2, 31))}</text>`);
                
                return `
                    <div class="id-card-container" style="width: 400px; margin: 20px auto; page-break-after: always;">
                        ${modifiedSvg}
                    </div>
                `;
            }).join('');
            
            // Set print content
            printContent.innerHTML = cardsHtml;
            
            // Show print container and trigger print
            printContainer.classList.remove('d-none');
            window.print();
            printContainer.classList.add('d-none');
            
            // Show success message
            showAlert(`Printed ${students.length} ID cards`, 'success');
        })
        .catch(error => {
            console.error('Error loading ID card template:', error);
            showAlert('Failed to load ID card template', 'danger');
        });
}

/**
 * Print bulk birthday cards
 * @param {Array} studentIds - Array of student IDs
 * @param {string} template - Template ID
 * @param {string} message - Custom message
 */
function printBulkBirthdayCards(studentIds, template, message) {
    // Get students from IDs
    const students = studentIds.map(id => getStudentById(id)).filter(Boolean);
    
    if (students.length === 0) {
        showAlert('No valid students found', 'danger');
        return;
    }
    
    // Create print container
    const printContainer = document.getElementById('print-container');
    const printContent = document.getElementById('print-content');
    
    if (!printContainer || !printContent) return;
    
    // Get template path based on selection
    const templatePath = template === 'template-1' 
        ? '../static/images/cards/birthday_card_1.svg'
        : '../static/images/cards/birthday_card_2.svg';
    
    // Load card template
    fetch(templatePath)
        .then(response => response.text())
        .then(svgText => {
            // Generate HTML for all birthday cards
            const cardsHtml = students.map(student => {
                const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
                const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
                
                // Create modified SVG with student data
                let modifiedSvg = svgText;
                modifiedSvg = modifiedSvg.replace(/id="student-name"[^>]*>Student Name<\/text>/g, `id="student-name">${fullName}</text>`);
                modifiedSvg = modifiedSvg.replace(/id="student-class"[^>]*>Class: X-A<\/text>/g, `id="student-class">Class: ${classSection}</text>`);
                
                // Add custom message if provided
                if (message) {
                    // This is a simplified approach. In a real app, you would
                    // need to find a suitable location in the SVG to add the message
                    modifiedSvg = modifiedSvg.replace('</svg>', `<text x="400" y="320" font-family="Arial" font-size="16" text-anchor="middle" fill="#2d3436">${message}</text></svg>`);
                }
                
                return `
                    <div class="birthday-card-container" style="width: 800px; margin: 20px auto; page-break-after: always;">
                        ${modifiedSvg}
                    </div>
                `;
            }).join('');
            
            // Set print content
            printContent.innerHTML = cardsHtml;
            
            // Show print container and trigger print
            printContainer.classList.remove('d-none');
            window.print();
            printContainer.classList.add('d-none');
            
            // Show success message
            showAlert(`Printed ${students.length} birthday cards`, 'success');
        })
        .catch(error => {
            console.error('Error loading birthday card template:', error);
            showAlert('Failed to load birthday card template', 'danger');
        });
}

/**
 * Print a single birthday card
 * @param {string} studentId - The student ID
 * @param {string} template - Template ID
 * @param {string} message - Custom message
 */
function printBirthdayCard(studentId, template, message) {
    printBulkBirthdayCards([studentId], template, message);
}

/**
 * Generate HTML for an admission form
 * @param {object} student - The student object
 * @returns {string} HTML for the admission form
 */
function generateAdmissionFormHtml(student) {
    const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
    const addressText = [
        student.address || '',
        student.city || '',
        student.pinCode || ''
    ].filter(Boolean).join(', ');
    
    return `
        <div class="admission-form">
            <div class="school-header">
                <img src="../static/images/logos/school_logo.svg" alt="School Logo" style="width: 80px; height: auto;">
                <h1 style="margin: 10px 0 5px; font-size: 24px;">School Name</h1>
                <p style="margin: 0; color: #666; font-size: 14px;">123 School Address, City, State - PIN</p>
                <p style="margin: 0; color: #666; font-size: 14px;">Phone: 123-456-7890 | Email: info@school.com</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0; padding-bottom: 10px; border-bottom: 2px solid #333;">
                <h2 style="margin: 0; text-transform: uppercase; font-size: 18px;">Student Admission Form</h2>
            </div>
            
            <div style="display: flex; margin-bottom: 20px;">
                <div style="flex: 3;">
                    <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Registration Details</div>
                    <div style="display: flex;">
                        <div style="flex: 1; margin-right: 15px;">
                            <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Admission No.</span>
                            <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.id || ''}</div>
                        </div>
                        <div style="flex: 1;">
                            <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Date of Admission</span>
                            <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${formatDate(student.admissionDate) || formatDate(new Date())}</div>
                        </div>
                    </div>
                </div>
                <div style="flex: 1;">
                    <div style="border: 1px solid #ddd; width: 120px; height: 150px; display: flex; justify-content: center; align-items: center; margin-left: auto; background-color: #f9f9f9;">
                        <span>Photograph</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Personal Information</div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="flex: 1; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">First Name</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.firstName || ''}</div>
                    </div>
                    <div style="flex: 1; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Middle Name</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.middleName || ''}</div>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Last Name</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.lastName || ''}</div>
                    </div>
                </div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="flex: 1; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Date of Birth</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${formatDate(student.dateOfBirth) || ''}</div>
                    </div>
                    <div style="flex: 1; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Gender</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.gender || ''}</div>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Blood Group</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.bloodGroup || ''}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Academic Information</div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="flex: 1; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Class</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.admissionClass || ''}</div>
                    </div>
                    <div style="flex: 1; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Section</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.section || ''}</div>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Roll Number</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.rollNo || ''}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Contact Information</div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="flex: 2; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Address</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${addressText}</div>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Mobile Number</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.mobileNumber || ''}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Parent/Guardian Information</div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="flex: 1; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Father's Name</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.fatherName || ''}</div>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Mother's Name</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.motherName || ''}</div>
                    </div>
                </div>
                <div style="display: flex; margin-bottom: 10px;">
                    <div style="flex: 1; margin-right: 15px;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Parent/Guardian Mobile</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.parentMobile || ''}</div>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Email</span>
                        <div style="border: 1px solid #ddd; padding: 8px; min-height: 20px; font-size: 14px; background-color: #f9f9f9;">${student.email || ''}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Declaration</div>
                <p style="font-size: 14px;">
                    I hereby declare that all the information provided above is correct to the best of my knowledge. I understand that providing
                    false information may result in the cancellation of admission. I agree to abide by all the rules and regulations of the
                    school.
                </p>
            </div>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div style="width: 200px; text-align: center;">
                    <div style="border-top: 1px solid #333; margin-top: 50px; padding-top: 5px;">Parent/Guardian's Signature</div>
                </div>
                <div style="width: 200px; text-align: center;">
                    <div style="border-top: 1px solid #333; margin-top: 50px; padding-top: 5px;">Principal's Signature</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate admission form preview for a student
 * @param {string} studentId - The student ID
 * @param {HTMLElement} container - The container element
 */
function generateAdmissionFormPreview(studentId, container) {
    const student = getStudentById(studentId);
    if (!student) {
        container.innerHTML = `<div class="alert alert-danger">Student not found</div>`;
        return;
    }
    
    // Set form preview in container
    container.innerHTML = `
        <div class="card">
            <div class="card-body p-0">
                <div class="admission-form-preview" style="max-height: 500px; overflow-y: auto; padding: 15px;">
                    ${generateAdmissionFormHtml(student)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate ID card preview for a student
 * @param {string} studentId - The student ID
 * @param {HTMLElement} container - The container element
 */
function generateIdCardPreview(studentId, container) {
    const student = getStudentById(studentId);
    if (!student) {
        container.innerHTML = `<div class="alert alert-danger">Student not found</div>`;
        return;
    }
    
    // Load ID card template
    fetch('../static/images/templates/id_card_template.svg')
        .then(response => response.text())
        .then(svgText => {
            const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
            const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
            
            // Create modified SVG with student data
            let modifiedSvg = svgText;
            modifiedSvg = modifiedSvg.replace(/id="student-name"[^>]*>Student Name<\/text>/g, `id="student-name">${fullName}</text>`);
            modifiedSvg = modifiedSvg.replace(/id="student-class"[^>]*>X-A<\/text>/g, `id="student-class">${classSection}</text>`);
            modifiedSvg = modifiedSvg.replace(/id="student-roll"[^>]*>1001<\/text>/g, `id="student-roll">${student.rollNo || ''}</text>`);
            modifiedSvg = modifiedSvg.replace(/id="student-dob"[^>]*>01-01-2010<\/text>/g, `id="student-dob">${formatDate(student.dateOfBirth) || ''}</text>`);
            modifiedSvg = modifiedSvg.replace(/id="valid-till"[^>]*>31-12-2023<\/text>/g, `id="valid-till">${formatDate(new Date(new Date().getFullYear() + 1, 2, 31))}</text>`);
            
            // Set preview in container
            container.innerHTML = `
                <div class="card">
                    <div class="card-body p-3 text-center">
                        <div class="id-card-preview">
                            ${modifiedSvg}
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error loading ID card template:', error);
            container.innerHTML = `<div class="alert alert-danger">Failed to load ID card template</div>`;
        });
}

/**
 * Generate birthday card preview for a student
 * @param {string} studentId - The student ID
 * @param {HTMLElement} container - The container element
 */
function generateBirthdayCardPreview(studentId, container) {
    const student = getStudentById(studentId);
    if (!student) {
        container.innerHTML = `<div class="alert alert-danger">Student not found</div>`;
        return;
    }
    
    // Load birthday card template (using template-1 as default)
    fetch('../static/images/cards/birthday_card_1.svg')
        .then(response => response.text())
        .then(svgText => {
            const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
            const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
            
            // Create modified SVG with student data
            let modifiedSvg = svgText;
            modifiedSvg = modifiedSvg.replace(/id="student-name"[^>]*>Student Name<\/text>/g, `id="student-name">${fullName}</text>`);
            modifiedSvg = modifiedSvg.replace(/id="student-class"[^>]*>Class: X-A<\/text>/g, `id="student-class">Class: ${classSection}</text>`);
            
            // Set preview in container
            container.innerHTML = `
                <div class="card">
                    <div class="card-body p-3 text-center">
                        <div class="birthday-card-preview" style="max-width: 100%; height: auto;">
                            ${modifiedSvg}
                        </div>
                        <div class="mt-3">
                            <p class="text-muted">This is the default birthday card template. You can select a different template when printing.</p>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error loading birthday card template:', error);
            container.innerHTML = `<div class="alert alert-danger">Failed to load birthday card template</div>`;
        });
}