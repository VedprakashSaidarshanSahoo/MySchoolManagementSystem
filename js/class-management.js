/**
 * School Management System
 * Class Management Module
 */

// Replacing the import statement with a dynamic module loader
(async function() {
    const { saveClassDataToFile } = await import('./data-manager.js');

    // Assign the function to the global scope for usage
    window.saveClassDataToFile = saveClassDataToFile;
})();

// Explicitly define saveClassDataToFile in the global scope
window.saveClassDataToFile = async function(classData) {
    const dataContainer = JSON.parse(localStorage.getItem('data_container') || '{}');
    const fileName = `${classData.name}_${classData.section}`;
    dataContainer[fileName] = classData;
    localStorage.setItem('data_container', JSON.stringify(dataContainer));
};

/**
 * Initialize the class management page
 */
async function initClassManagement() {
    console.log('Initializing class management page...');

    // Load classes from storage
    await loadClasses();

    // Setup event listeners
    setupClassManagementEvents();
}

let timetableData = {};

// Function to add a new row for a time slot
function addRow() {
    rowCount++;
    const tableBody = document.querySelector("#timetable tbody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
                                        <td><input type="time" name="start_time_${rowCount}" required></td>
                                        <td><input type="time" name="end_time_${rowCount}" required></td>
                                        <td>
                                            <select name="subject_monday_${rowCount}" required>
                                                <option value="" disabled selected>-- Select Subject --</option>
                                                <option value="math">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="history">History</option>
                                                <option value="english">English</option>
                                                <option value="art">Art</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select name="subject_tuesday_${rowCount}" required>
                                                <option value="" disabled selected>-- Select Subject --</option>
                                                <option value="math">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="history">History</option>
                                                <option value="english">English</option>
                                                <option value="art">Art</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select name="subject_wednesday_${rowCount}" required>
                                                <option value="" disabled selected>-- Select Subject --</option>
                                                <option value="math">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="history">History</option>
                                                <option value="english">English</option>
                                                <option value="art">Art</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select name="subject_thursday_${rowCount}" required>
                                                <option value="" disabled selected>-- Select Subject --</option>
                                                <option value="math">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="history">History</option>
                                                <option value="english">English</option>
                                                <option value="art">Art</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select name="subject_friday_${rowCount}" required>
                                                <option value="" disabled selected>-- Select Subject --</option>
                                                <option value="math">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="history">History</option>
                                                <option value="english">English</option>
                                                <option value="art">Art</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select name="subject_saturday_${rowCount}" required>
                                                <option value="" disabled selected>-- Select Subject --</option>
                                                <option value="math">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="history">History</option>
                                                <option value="english">English</option>
                                                <option value="art">Art</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select name="subject_sunday_${rowCount}" required>
                                                <option value="" disabled selected>-- Select Subject --</option>
                                                <option value="math">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="history">History</option>
                                                <option value="english">English</option>
                                                <option value="art">Art</option>
                                            </select>
                                        </td>
                                    `;

    tableBody.appendChild(newRow);
}

function addPeriod() {
    const table = document.getElementById('timetable');
    const headerRow = table.querySelector('thead tr');
    const bodyRows = table.querySelectorAll('tbody tr');

    const newPeriodIndex = headerRow.children.length - 1;
    const newPeriodHeader = document.createElement('th');
    newPeriodHeader.textContent = `Period ${newPeriodIndex}`;
    headerRow.insertBefore(newPeriodHeader, headerRow.lastElementChild);

    bodyRows.forEach(row => {
        const newCell = document.createElement('td');
        newCell.innerHTML = `<select class='form-select' name='${row.children[0].textContent.toLowerCase()}_period_${newPeriodIndex}'></select>`;
        row.appendChild(newCell);
    });

    populateSubjectsDropdown(); // Ensure subjects are populated
}

// Add removePeriod function to remove the last period column
function removePeriod() {
    const table = document.getElementById('timetable');
    const headerRow = table.querySelector('thead tr');
    const bodyRows = table.querySelectorAll('tbody tr');

    // Ensure there are more than one period columns to remove
    if (headerRow.children.length > 2) { // Ensure "Day" column is not removed
        headerRow.removeChild(headerRow.lastElementChild.previousElementSibling);

        bodyRows.forEach(row => {
            row.removeChild(row.lastElementChild);
        });
    }
}

function printTimetable() {
    const table = document.getElementById('timetable');
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Timetable</title></head><body>');
    printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { padding: 8px; text-align: center; } th { background-color: #f2f2f2; } td { border: none; }</style>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function saveTimetableData() {
    const table = document.getElementById('timetable');
    const rows = table.querySelectorAll('tbody tr');

    timetableData = {};
    rows.forEach(row => {
        const day = row.children[0].textContent;
        timetableData[day] = {};
        for (let i = 1; i < row.children.length; i++) {
            const period = `Period ${i}`;
            const subject = row.children[i].querySelector('select').value;
            timetableData[day][period] = subject;
        }
    });

    console.log('Timetable Data:', timetableData);
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
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                filterClasses();
            }
        });
    }

    // Setup export button
    const exportBtn = document.getElementById('export-classes-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
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
        printBtn.addEventListener('click', function () {
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
        confirmDeleteClassBtn.addEventListener('click', function () {
            const className = document.getElementById('delete-class-name').getAttribute('data-class');
            const section = document.getElementById('delete-class-name').getAttribute('data-section');

            deleteClass(className, section);
        });
    }

    // Populate teacher dropdowns in add/edit forms
    populateTeacherDropdowns();
}

/**
 * Load classes from storage
 */
async function loadClasses() {
    const classes = getClasses();
    const students = await getAllStudents();
    displayClasses(classes, students);
    updateClassCharts(classes, students);
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
function displayClasses(classes, students) {
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
function updateClassCharts(classes, students) {
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
                        label: function (context) {
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
    const teachers = JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => user.type === 'teacher');

    const teacherDropdowns = [
        document.getElementById('class-teacher'),
        document.getElementById('edit-class-teacher')
    ];

    teacherDropdowns.forEach(dropdown => {
        if (!dropdown) return;

        // Clear existing options except the first one
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
async function saveClass() {
    const classNameField = document.getElementById('class-name');
    const sectionField = document.getElementById('class-section');
    const roomField = document.getElementById('class-room');
    const teacherField = document.getElementById('class-teacher');
    const descriptionField = document.getElementById('class-description');

    const className = classNameField?.value?.trim();
    const section = sectionField?.value?.trim();
    const room = roomField?.value?.trim() || '-';
    const teacherId = teacherField?.value?.trim() || null;
    const description = descriptionField?.value?.trim() || '';

    const newClass = {
        id: generateUniqueId(),
        name: className,
        section: section,
        room: room,
        teacherId: teacherId,
        description: description,
        subjects: [],
        createdAt: new Date().toISOString()
    };

    try {
        await window.saveClassDataToFile(newClass);
        showAlert(`Class saved successfully`, 'success');

        // Clear form fields for new entries
        if (classNameField) classNameField.value = '';
        if (sectionField) sectionField.value = '';
        if (roomField) roomField.value = '';
        if (teacherField) teacherField.value = '';
        if (descriptionField) descriptionField.value = '';

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addClassModal'));
        if (modal) {
            modal.hide();
        }

        // Reload classes
        loadClasses();
    } catch (error) {
        console.error('Error saving class:', error);
        showAlert('Failed to save class. Please try again.', 'danger');
    }
}

/**
 * View class details
 * @param {string} className - Class name
 * @param {string} section - Section name
 */
async function viewClassDetails(className, section) {
    const classes = getClasses();
    const classData = classes.find(c => c.name === className && c.section === section);

    if (!classData) {
        showAlert('Class not found', 'danger');
        return;
    }

    let teacherName = 'Not Assigned';
    if (classData.teacherId) {
        const teachers = JSON.parse(localStorage.getItem('users') || '[]').filter(user => user.type === 'teacher');
        const teacher = teachers.find(t => t.id === classData.teacherId);
        if (teacher) {
            teacherName = teacher.name;
        }
    }

    // Ensure elements exist before setting their properties
    const classNameElement = document.getElementById('view-class-name');
    const sectionElement = document.getElementById('view-section');
    const roomElement = document.getElementById('view-room');
    const teacherElement = document.getElementById('view-teacher');
    const descriptionElement = document.getElementById('view-description');

    if (classNameElement) classNameElement.textContent = classData.name;
    if (sectionElement) sectionElement.textContent = classData.section;
    if (roomElement) roomElement.textContent = classData.room || '-';
    if (teacherElement) teacherElement.textContent = teacherName;
    if (descriptionElement) descriptionElement.textContent = classData.description || '-';

    const timetableBody = document.getElementById('view-timetable-body');
    if (timetableBody) {
        timetableBody.innerHTML = '';
        if (classData.timetable && classData.timetable.length > 0) {
            classData.timetable.forEach(day => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${day.day}</td>` +
                    day.schedule.map(period => `<td>${period.subject || '-'}</td>`).join('');
                timetableBody.appendChild(row);
            });
        } else {
            timetableBody.innerHTML = `<tr><td colspan="8" class="text-center">No timetable assigned</td></tr>`;
        }
    }

    const modal = new bootstrap.Modal(document.getElementById('viewClassModal'));
    modal.show();
}

/**
 * Edit class
 * @param {string} className - Class name
 * @param {string} section - Section name
 */
async function editClass(className, section) {
    const classes = getClasses();
    const classData = classes.find(c => c.name === className && c.section === section);

    if (!classData) {
        showAlert('Class not found', 'danger');
        return;
    }

    // Populate the modal fields with existing class data
    const classNameField = document.getElementById('class-name');
    const sectionField = document.getElementById('class-section');
    const roomField = document.getElementById('class-room');
    const teacherField = document.getElementById('class-teacher');
    const descriptionField = document.getElementById('class-description');

    if (classNameField) classNameField.value = classData.name;
    if (sectionField) sectionField.value = classData.section;
    if (roomField) roomField.value = classData.room || '';
    if (teacherField) teacherField.value = classData.teacherId || '';
    if (descriptionField) descriptionField.value = classData.description || '';

    // Open the modal for editing
    const modal = new bootstrap.Modal(document.getElementById('addClassModal'));
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

/**
 * Generate timetable for all 7 days
 * @param {Array} subjects - Array of subjects
 * @returns {Array} - Timetable data
 */
function generateTimetable(subjects) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const periods = ['8:00-9:00', '9:00-10:00', '10:15-11:15', '11:15-12:15', '1:00-2:00'];

    return days.map(day => ({
        day,
        schedule: periods.map((time, index) => ({
            time,
            subject: subjects[index % subjects.length]
        }))
    }));
}

/**
 * Populate subjects dropdowns in the timetable
 */
function populateSubjectsDropdown() {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Art'];
    const dropdowns = document.querySelectorAll('#timetable select');

    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option value="" disabled selected>-- Select Subject --</option>';
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            dropdown.appendChild(option);
        });
    });
}

// Call this function after the timetable is rendered
populateSubjectsDropdown();

// Updated Add Subject and Submit functionality to use localStorage

// Using the globally defined subjectsArray from utils.js

// Event listener for Add Subject button
const addSubjectBtn = document.getElementById('add-subject-btn');
const subjectNameInput = document.getElementById('subject-name');
const subjectList = document.getElementById('subject-list');

if (addSubjectBtn) {
    console.log('addSubjectBtn element found'); // Debugging log
    addSubjectBtn.addEventListener('click', () => {
        console.log('Add Subject button clicked'); // Debugging log
        const subjectName = subjectNameInput.value.trim();
        if (subjectName) {
            // Check if subject already exists
            if (!subjectsArray.includes(subjectName)) {
                // Add subject to the array
                subjectsArray.push(subjectName);
                localStorage.setItem('subjectsArray', JSON.stringify(subjectsArray)); // Save to localStorage

                // Update the UI
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.textContent = subjectName;
                subjectList.appendChild(listItem);

                // Clear the input field
                subjectNameInput.value = '';
            } else {
                showAlert('Subject already exists in the list.', 'warning');
            }
        } else {
            showAlert('Please enter a subject name.', 'warning');
        }
    });
} else {
    console.log('addSubjectBtn element not found'); // Debugging log
}

// Populate the subject list on page load
if (subjectList) {
    subjectsArray.forEach(subject => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = subject;
        subjectList.appendChild(listItem);
    });
}

// Ensure the 'Submit Subjects' button updates the timetable dropdowns correctly
const submitSubjectsBtn = document.getElementById('submit-subjects-btn');
if (submitSubjectsBtn) {
    submitSubjectsBtn.addEventListener('click', () => {
        const subjectList = document.getElementById('subject-list');
        const subjects = Array.from(subjectList.children).map(item => item.textContent.trim());

        if (subjects.length > 0) {
            // Save subjects to localStorage
            localStorage.setItem('subjectsArray', JSON.stringify(subjects));

            // Update timetable dropdowns
            const dropdowns = document.querySelectorAll('#timetable select');
            dropdowns.forEach(dropdown => {
                dropdown.innerHTML = '<option value="" disabled selected>-- Select Subject --</option>';
                subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    option.textContent = subject;
                    dropdown.appendChild(option);
                });
            });

            // Provide feedback to the user
            showAlert('Subjects submitted successfully!', 'success');

            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectsModal'));
            if (modal) {
                modal.hide();
            }
        } else {
            showAlert('No subjects to submit. Please add subjects first.', 'warning');
        }
    });
}