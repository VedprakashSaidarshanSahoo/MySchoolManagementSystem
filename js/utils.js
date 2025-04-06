/**
 * School Management System
 * Utility Functions
 */

// const API_BASE_URL = "https://proud-new-sponge.ngrok-free.app/api";
const API_BASE_URL = "http://localhost:8000/api";
const STUDENT_API_URL = `${API_BASE_URL}/students`;

// Global subjects array
let subjectsArray = JSON.parse(localStorage.getItem('subjectsArray')) || []; // Load existing subjects from localStorage

// Utility function to save subjects to localStorage
function saveSubjectsToLocalStorage(subjects) {
    localStorage.setItem('subjectsArray', JSON.stringify(subjects));
}

// Utility function to get subjects from localStorage
function getSubjectsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('subjectsArray')) || [];
}

/**
 * Show an alert message
 * @param {string} message - The message to show
 * @param {string} type - Alert type (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    
    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type} alert-dismissible fade show alert-animated`;
    alertEl.setAttribute('role', 'alert');
    
    // Add content
    alertEl.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    alertContainer.appendChild(alertEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alertEl.classList.add('fade-out');
        setTimeout(() => {
            alertEl.remove();
        }, 300);
    }, 5000);
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateUniqueId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get all students from localStorage
 * @returns {Array} Array of student objects
 */
async function getAllStudents() {
    return new Promise((resolve, reject) => {
        fetch(STUDENT_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Fetched students:', data);
            resolve(data || []); // Resolve the promise with the fetched data
        })
        .catch(error => {
            console.error('Error fetching students:', error);
            reject(error); // Reject the promise in case of an error
        });
    });
}

function postAllStudents(studentData) {
    // Store the JSON data in a variable
    const studentPayload = JSON.stringify(studentData);

    // Send the data to the API endpoint
    fetch(STUDENT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: studentPayload
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit student data');
        }
        return response.json();
    })
    .then(data => {
        console.log('Student data submitted successfully:', data);
        showAlert('Student data submitted successfully!', 'success');
    })
    .catch(error => {
        console.error('Error submitting student data:', error);
        showAlert('Error submitting student data. Please try again.', 'danger');
    });
}

/**
 * Get a student by ID
 * @param {string} id - The student ID
 * @returns {object|null} The student object or null if not found
 */
async function getStudentById(id) {
    const students = await getAllStudents(); // Await the promise to resolve
    return students.find(student => student.id === id) || null;
}

/**
 * Get a student by roll number
 * @param {string} rollNo - The roll number
 * @returns {object|null} The student object or null if not found
 */
function getStudentByRollNo(rollNo) {
    const students = getAllStudents();
    return students.find(student => student.rollNo === rollNo) || null;
}

/**
 * Update a student in localStorage
 * @param {object} updatedStudent - The updated student object
 */
function updateStudent(updatedStudent) {
    const students = getAllStudents();
    const index = students.findIndex(student => student.id === updatedStudent.id);
    
    if (index !== -1) {
        students[index] = updatedStudent;
        localStorage.setItem('students', JSON.stringify(students));
        return true;
    }
    
    return false;
}

/**
 * Remove a student from localStorage
 * @param {string} id - The student ID
 */
async function removeStudent(id) {
    const students = await getAllStudents(); // Await the promise to resolve
    const filteredStudents = students.filter(student => student.id !== id);
    console.log("To Be Deleted: ", filteredStudents);
    if (filteredStudents.length < students.length) {
        localStorage.setItem('students', JSON.stringify(filteredStudents));
        return true;
    }
    
    return false;
}

/**
 * Format a date string to a readable format
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {string} Formatted date string (e.g., January 1, 2023)
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Toggle a loader element
 * @param {string} elementId - The element ID to toggle loading state
 * @param {boolean} isLoading - Whether to show or hide the loader
 */
function toggleLoader(elementId, isLoading) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (isLoading) {
        element.classList.add('d-none');
        
        // Create and show loader
        const loader = document.createElement('div');
        loader.id = `${elementId}-loader`;
        loader.className = 'text-center py-3';
        loader.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading...</p>
        `;
        
        element.parentNode.insertBefore(loader, element.nextSibling);
    } else {
        element.classList.remove('d-none');
        
        // Remove loader
        const loader = document.getElementById(`${elementId}-loader`);
        if (loader) {
            loader.remove();
        }
    }
}

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Validate a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if phone number is valid
 */
function isValidPhone(phone) {
    // Basic validation - customize as needed for your region's phone format
    const re = /^\+?[0-9\-\s]{10,15}$/;
    return re.test(String(phone));
}

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth in format YYYY-MM-DD
 * @returns {number} Age in years
 */
function calculateAge(dob) {
    if (!dob) return 0;
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Check if a date is today
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {boolean} True if the date is today
 */
function isToday(dateString) {
    if (!dateString) return false;
    
    const inputDate = new Date(dateString);
    const today = new Date();
    
    return inputDate.getDate() === today.getDate() && 
           inputDate.getMonth() === today.getMonth() && 
           inputDate.getFullYear() === today.getFullYear();
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getTodayFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Download data as a CSV file
 * @param {Array} data - Array of objects to convert to CSV
 * @param {string} filename - The filename for the download
 */
function downloadCSV(data, filename) {
    if (!data || !data.length) {
        showAlert('No data to export', 'warning');
        return;
    }
    
    // Extract headers
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
        const row = headers.map(header => {
            let value = item[header] || '';
            // Escape quotes and wrap in quotes if contains comma or newline
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function displayImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.style.backgroundImage = `url(${e.target.result})`;
        imagePreview.style.backgroundSize = 'cover';
        imagePreview.style.backgroundPosition = 'center';
        imagePreview.innerHTML = ''; // Remove the "Click to select an image" text
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

/**
 * Remove a period from the timetable
 */
function removePeriod() {
    const table = document.getElementById('timetable');
    const headerRow = table.querySelector('thead tr');
    const bodyRows = table.querySelectorAll('tbody tr');

    // Ensure there are more than two columns (Day + at least one Period) to remove
    if (headerRow.children.length > 2) {
        headerRow.removeChild(headerRow.children[headerRow.children.length - 1]);

        bodyRows.forEach(row => {
            row.removeChild(row.children[row.children.length - 1]);
        });
    }
}