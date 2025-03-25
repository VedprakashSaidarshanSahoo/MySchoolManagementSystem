/**
 * School Management System
 * Class Management Module
 */

/**
 * Initialize the class management page
 */
function initClassManagement() {
    console.log('Initializing class management page...');
    
    // Load classes from storage
    loadClasses();
    
    // Setup event listeners
    setupClassManagementEvents();
}

/**
 * Setup event listeners for class management
 */
function setupClassManagementEvents() {
    // Setup search functionality
    const searchInput = document.getElementById('class-search-input');
    const searchBtn = document.getElementById('class-search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', filterClasses);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterClasses();
            }
        });
    }
    
    // Setup export button
    const exportBtn = document.getElementById('export-classes-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // Get classes data from table
            const classes = getClassesFromTable();
            
            // Prepare data for export
            const exportData = classes.map(classData => {
                return {
                    'Class': classData.name,
                    'Section': classData.section,
                    'Room': classData.room,
                    'Class Teacher': classData.teacher,
                    'Students': classData.students,
                    'Subjects': classData.subjects
                };
            });
            
            // Generate CSV and download
            downloadCSV(exportData, 'classes_' + new Date().toISOString().slice(0, 10) + '.csv');
        });
    }
    
    // Setup print button
    const printBtn = document.getElementById('print-classes-btn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Setup save class button
    const saveClassBtn = document.getElementById('save-class-btn');
    if (saveClassBtn) {
        saveClassBtn.addEventListener('click', saveClass);
    }
    
    // Setup update class button
    const updateClassBtn = document.getElementById('update-class-btn');
    if (updateClassBtn) {
        updateClassBtn.addEventListener('click', updateClass);
    }
    
    // Setup delete class confirmation button
    const confirmDeleteClassBtn = document.getElementById('confirm-delete-class-btn');
    if (confirmDeleteClassBtn) {
        confirmDeleteClassBtn.addEventListener('click', function() {
            const className = document.getElementById('delete-class-name').getAttribute('data-class');
            const section = document.getElementById('delete-class-name').getAttribute('data-section');
            
            deleteClass(className, section);
        });
    }
    
    // Populate teacher dropdown in add/edit forms
    populateTeacherDropdowns();
}

/**
 * Load classes from storage
 */
function loadClasses() {
    // Get classes from storage or default ones
    const classes = getClasses();
    
    // Display classes in the table
    displayClasses(classes);
    
    // Update charts
    updateClassCharts(classes);
}

/**
 * Get classes from localStorage or create default ones
 * @returns {Array} Array of class objects
 */
function getClasses() {
    // Try to get classes from localStorage
    const storedClasses = localStorage.getItem('classes');
    if (storedClasses) {
        return JSON.parse(storedClasses);
    }
    
    // If no classes exist, create default ones
    const defaultClasses = [
        {
            id: generateUniqueId(),
            name: 'IX',
            section: 'A',
            room: '101',
            teacherId: null,
            description: 'Ninth grade section A',
            subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science']
        },
        {
            id: generateUniqueId(),
            name: 'IX',
            section: 'B',
            room: '102',
            teacherId: null,
            description: 'Ninth grade section B',
            subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science']
        },
        {
            id: generateUniqueId(),
            name: 'X',
            section: 'A',
            room: '201',
            teacherId: 'teacher1',
            description: 'Tenth grade section A',
            subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Computer Science']
        },
        {
            id: generateUniqueId(),
            name: 'X',
            section: 'B',
            room: '202',
            teacherId: 'teacher1',
            description: 'Tenth grade section B',
            subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Computer Science']
        },
        {
            id: generateUniqueId(),
            name: 'XI',
            section: 'A',
            room: '301',
            teacherId: 'teacher1',
            description: 'Eleventh grade section A - Science',
            subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology']
        },
        {
            id: generateUniqueId(),
            name: 'XI',
            section: 'B',
            room: '302',
            teacherId: null,
            description: 'Eleventh grade section B - Commerce',
            subjects: ['Mathematics', 'English', 'Accountancy', 'Economics', 'Business Studies']
        },
        {
            id: generateUniqueId(),
            name: 'XII',
            section: 'A',
            room: '401',
            teacherId: null,
            description: 'Twelfth grade section A - Science',
            subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology']
        },
        {
            id: generateUniqueId(),
            name: 'XII',
            section: 'B',
            room: '402',
            teacherId: 'teacher2',
            description: 'Twelfth grade section B - Commerce',
            subjects: ['Mathematics', 'English', 'Accountancy', 'Economics', 'Business Studies']
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('classes', JSON.stringify(defaultClasses));
    
    return defaultClasses;
}

/**
 * Display classes in the table
 * @param {Array} classes - Array of class objects
 */
function displayClasses(classes) {
    const tableBody = document.getElementById('class-table-body');
    if (!tableBody) return;
    
    // Clear previous content
    tableBody.innerHTML = '';
    
    if (classes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No classes found</td>
            </tr>
        `;
        return;
    }
    
    // Get teachers for mapping
    const teachers = JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => user.type === 'teacher');
    
    // Get students for counting
    const students = getAllStudents();
    
    // Add classes to table
    classes.forEach(classItem => {
        const row = document.createElement('tr');
        
        // Find teacher name
        let teacherName = 'Not Assigned';
        if (classItem.teacherId) {
            const teacher = teachers.find(t => t.id === classItem.teacherId);
            if (teacher) {
                teacherName = teacher.name;
            }
        }
        
        // Count students in this class
        const studentCount = countStudentsInClass(students, classItem.name, classItem.section);
        
        row.innerHTML = `
            <td>${classItem.name}</td>
            <td>${classItem.section}</td>
            <td>${classItem.room || '-'}</td>
            <td>${teacherName}</td>
            <td>${studentCount}</td>
            <td>${classItem.subjects ? classItem.subjects.length : 0}</td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-primary me-1" onclick="viewClassDetails('${classItem.name}', '${classItem.section}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-warning me-1" onclick="editClass('${classItem.name}', '${classItem.section}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="confirmDeleteClass('${classItem.name}', '${classItem.section}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Count number of students in a specific class
 * @param {Array} students - Array of student objects
 * @param {string} className - Class name
 * @param {string} section - Section name
 * @returns {number} - Number of students in the class
 */
function countStudentsInClass(students, className, section) {
    return students.filter(student => 
        student.admissionClass === className && 
        student.section === section
    ).length;
}

/**
 * Update class distribution and students per class charts
 * @param {Array} classes - Array of class objects
 */
function updateClassCharts(classes) {
    if (!classes || classes.length === 0) return;
    
    // Prepare data for class distribution chart
    const classDistributionData = [];
    const uniqueClasses = [...new Set(classes.map(c => c.name))];
    
    uniqueClasses.forEach(className => {
        const count = classes.filter(c => c.name === className).length;
        classDistributionData.push({
            name: className,
            count: count
        });
    });
    
    // Update class distribution chart
    updateClassDistributionChart(classDistributionData);
    
    // Prepare data for students per class chart
    const studentsPerClassData = [];
    const students = getAllStudents();
    
    classes.forEach(classItem => {
        const className = `${classItem.name}-${classItem.section}`;
        const count = countStudentsInClass(students, classItem.name, classItem.section);
        studentsPerClassData.push({
            name: className,
            count: count
        });
    });
    
    // Update students per class chart
    updateStudentsPerClassChart(studentsPerClassData);
}

/**
 * Update the class distribution chart
 * @param {Array} data - Array of {name, count} objects
 */
function updateClassDistributionChart(data) {
    const canvas = document.getElementById('classDistributionChart');
    if (!canvas) return;
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Prepare chart data
    const labels = data.map(item => item.name);
    const counts = data.map(item => item.count);
    
    // Generate colors
    const colors = generateChartColors(data.length);
    
    // Create new chart
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                hoverOffset: 4
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
                    text: 'Class Distribution'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the students per class chart
 * @param {Array} data - Array of {name, count} objects
 */
function updateStudentsPerClassChart(data) {
    const canvas = document.getElementById('studentsPerClassChart');
    if (!canvas) return;
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Sort data by class name
    data.sort((a, b) => a.name.localeCompare(b.name));
    
    // Prepare chart data
    const labels = data.map(item => item.name);
    const counts = data.map(item => item.count);
    
    // Generate colors
    const colors = generateChartColors(data.length);
    
    // Create new chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Students',
                data: counts,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.7', '1')),
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
                        text: 'Number of Students'
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
                    text: 'Students per Class'
                }
            }
        }
    });
}

/**
 * Filter classes based on input
 */
function filterClasses() {
    const searchInput = document.getElementById('class-search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // If search term is empty, show all classes
    if (!searchTerm) {
        loadClasses();
        return;
    }
    
    // Get all classes
    const allClasses = getClasses();
    
    // Get teachers for searching
    const teachers = JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => user.type === 'teacher');
    
    // Filter classes based on search term
    const filteredClasses = allClasses.filter(classItem => {
        // Search by class name
        if (classItem.name.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search by section
        if (classItem.section.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search by room
        if (classItem.room && classItem.room.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search by teacher name
        if (classItem.teacherId) {
            const teacher = teachers.find(t => t.id === classItem.teacherId);
            if (teacher && teacher.name.toLowerCase().includes(searchTerm)) {
                return true;
            }
        }
        
        // Search by subject
        if (classItem.subjects && classItem.subjects.some(subject => 
            subject.toLowerCase().includes(searchTerm))) {
            return true;
        }
        
        return false;
    });
    
    // Display filtered classes
    displayClasses(filteredClasses);
}

/**
 * Populate teacher dropdowns in add/edit forms
 */
function populateTeacherDropdowns() {
    // Get teachers
    const teachers = JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => user.type === 'teacher');
    
    // Get dropdown elements
    const teacherDropdowns = [
        document.getElementById('class-teacher'),
        document.getElementById('edit-class-teacher')
    ];
    
    teacherDropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        // Clear existing options except first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Add teacher options
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            dropdown.appendChild(option);
        });
    });
}

/**
 * Get classes data from the table
 * @returns {Array} Array of class objects from the table
 */
function getClassesFromTable() {
    const tableRows = document.querySelectorAll('#class-table-body tr');
    const classes = [];
    
    tableRows.forEach(row => {
        if (row.cells.length < 6) return;
        
        classes.push({
            name: row.cells[0].textContent,
            section: row.cells[1].textContent,
            room: row.cells[2].textContent,
            teacher: row.cells[3].textContent,
            students: row.cells[4].textContent,
            subjects: row.cells[5].textContent
        });
    });
    
    return classes;
}

/**
 * Save a new class
 */
function saveClass() {
    // Get form values
    const className = document.getElementById('class-name').value;
    const section = document.getElementById('class-section').value;
    const room = document.getElementById('class-room').value;
    const teacherId = document.getElementById('class-teacher').value;
    const description = document.getElementById('class-description').value;
    
    // Validate required fields
    if (!className || !section) {
        showAlert('Class name and section are required', 'warning');
        return;
    }
    
    // Get existing classes
    const classes = getClasses();
    
    // Check if class with same name and section already exists
    if (classes.some(c => c.name === className && c.section === section)) {
        showAlert(`Class ${className}-${section} already exists`, 'warning');
        return;
    }
    
    // Create new class object
    const newClass = {
        id: generateUniqueId(),
        name: className,
        section: section,
        room: room,
        teacherId: teacherId || null,
        description: description,
        subjects: [],
        createdAt: new Date().toISOString()
    };
    
    // Add to classes array
    classes.push(newClass);
    
    // Save to localStorage
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // Reset form
    document.getElementById('add-class-form').reset();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addClassModal'));
    if (modal) {
        modal.hide();
    }
    
    // Reload classes
    loadClasses();
    
    // Show success message
    showAlert(`Class ${className}-${section} added successfully`, 'success');
}

/**
 * View class details
 * @param {string} className - Class name
 * @param {string} section - Section name
 */
function viewClassDetails(className, section) {
    // Get class data
    const classes = getClasses();
    const classData = classes.find(c => c.name === className && c.section === section);
    
    if (!classData) {
        showAlert('Class not found', 'danger');
        return;
    }
    
    // Find teacher name
    let teacherName = 'Not Assigned';
    if (classData.teacherId) {
        const teachers = JSON.parse(localStorage.getItem('users') || '[]')
            .filter(user => user.type === 'teacher');
        const teacher = teachers.find(t => t.id === classData.teacherId);
        if (teacher) {
            teacherName = teacher.name;
        }
    }
    
    // Count students
    const students = getAllStudents();
    const studentCount = countStudentsInClass(students, className, section);
    
    // Update modal content
    document.getElementById('view-class-name').textContent = className;
    document.getElementById('view-section').textContent = section;
    document.getElementById('view-room').textContent = classData.room || '-';
    document.getElementById('view-teacher').textContent = teacherName;
    document.getElementById('view-students').textContent = studentCount;
    document.getElementById('view-description').textContent = classData.description || '-';
    
    // Get subjects table body
    const subjectsBody = document.getElementById('view-subjects-body');
    if (subjectsBody) {
        subjectsBody.innerHTML = '';
        
        // Add subjects
        if (classData.subjects && classData.subjects.length > 0) {
            classData.subjects.forEach(subject => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${subject}</td>
                    <td>-</td>
                    <td>-</td>
                `;
                subjectsBody.appendChild(row);
            });
        } else {
            subjectsBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">No subjects assigned</td>
                </tr>
            `;
        }
    }
    
    // Get students in this class
    const classStudents = students.filter(student => 
        student.admissionClass === className && 
        student.section === section
    );
    
    // Get students table body
    const studentsBody = document.getElementById('view-students-body');
    if (studentsBody) {
        studentsBody.innerHTML = '';
        
        // Add students
        if (classStudents.length > 0) {
            classStudents.forEach(student => {
                const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.rollNo || '-'}</td>
                    <td>${fullName}</td>
                    <td>${student.gender || '-'}</td>
                    <td>${student.mobileNumber || '-'}</td>
                `;
                studentsBody.appendChild(row);
            });
        } else {
            studentsBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No students in this class</td>
                </tr>
            `;
        }
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewClassModal'));
    modal.show();
}

/**
 * Edit class
 * @param {string} className - Class name
 * @param {string} section - Section name
 */
function editClass(className, section) {
    // Get class data
    const classes = getClasses();
    const classData = classes.find(c => c.name === className && c.section === section);
    
    if (!classData) {
        showAlert('Class not found', 'danger');
        return;
    }
    
    // Set form values
    document.getElementById('edit-class-id').value = classData.id;
    document.getElementById('edit-class-name').value = classData.name;
    document.getElementById('edit-class-section').value = classData.section;
    document.getElementById('edit-class-room').value = classData.room || '';
    document.getElementById('edit-class-teacher').value = classData.teacherId || '';
    document.getElementById('edit-class-description').value = classData.description || '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editClassModal'));
    modal.show();
}

/**
 * Update class data
 */
function updateClass() {
    // Get form values
    const classId = document.getElementById('edit-class-id').value;
    const className = document.getElementById('edit-class-name').value;
    const section = document.getElementById('edit-class-section').value;
    const room = document.getElementById('edit-class-room').value;
    const teacherId = document.getElementById('edit-class-teacher').value;
    const description = document.getElementById('edit-class-description').value;
    
    // Validate required fields
    if (!className || !section) {
        showAlert('Class name and section are required', 'warning');
        return;
    }
    
    // Get existing classes
    const classes = getClasses();
    
    // Find class by ID
    const classIndex = classes.findIndex(c => c.id === classId);
    
    if (classIndex === -1) {
        showAlert('Class not found', 'danger');
        return;
    }
    
    // Check if another class with same name and section exists
    if (classes.some(c => c.id !== classId && c.name === className && c.section === section)) {
        showAlert(`Class ${className}-${section} already exists`, 'warning');
        return;
    }
    
    // Get the class to update
    const classToUpdate = classes[classIndex];
    
    // Create updated class object
    const updatedClass = {
        ...classToUpdate,
        name: className,
        section: section,
        room: room,
        teacherId: teacherId || null,
        description: description,
        updatedAt: new Date().toISOString()
    };
    
    // Update classes array
    classes[classIndex] = updatedClass;
    
    // Save to localStorage
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editClassModal'));
    if (modal) {
        modal.hide();
    }
    
    // Reload classes
    loadClasses();
    
    // Show success message
    showAlert(`Class ${className}-${section} updated successfully`, 'success');
}

/**
 * Confirm delete class
 * @param {string} className - Class name
 * @param {string} section - Section name
 */
function confirmDeleteClass(className, section) {
    // Set class name in confirmation dialog
    const deleteClassName = document.getElementById('delete-class-name');
    deleteClassName.textContent = `${className}-${section}`;
    deleteClassName.setAttribute('data-class', className);
    deleteClassName.setAttribute('data-section', section);
    
    // Show confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('deleteClassModal'));
    modal.show();
}

/**
 * Delete class
 * @param {string} className - Class name
 * @param {string} section - Section name
 */
function deleteClass(className, section) {
    // Get existing classes
    const classes = getClasses();
    
    // Remove class
    const updatedClasses = classes.filter(c => !(c.name === className && c.section === section));
    
    // Save to localStorage
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteClassModal'));
    if (modal) {
        modal.hide();
    }
    
    // Reload classes
    loadClasses();
    
    // Show success message
    showAlert(`Class ${className}-${section} deleted successfully`, 'success');
}

/**
 * Generate colors for charts
 * @param {number} count - Number of colors to generate
 * @returns {Array} - Array of color strings
 */
function generateChartColors(count) {
    const baseColors = [
        'rgba(78, 115, 223, 0.7)',
        'rgba(28, 200, 138, 0.7)',
        'rgba(54, 185, 204, 0.7)',
        'rgba(246, 194, 62, 0.7)',
        'rgba(231, 74, 59, 0.7)',
        'rgba(133, 135, 150, 0.7)',
        'rgba(105, 70, 180, 0.7)',
        'rgba(0, 163, 136, 0.7)'
    ];
    
    // If we have enough base colors, return a slice
    if (count <= baseColors.length) {
        return baseColors.slice(0, count);
    }
    
    // Otherwise, generate additional colors
    const colors = [...baseColors];
    
    for (let i = baseColors.length; i < count; i++) {
        const r = Math.floor(Math.random() * 200 + 55);
        const g = Math.floor(Math.random() * 200 + 55);
        const b = Math.floor(Math.random() * 200 + 55);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    
    return colors;
}