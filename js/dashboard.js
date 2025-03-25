/**
 * School Management System
 * Dashboard Page Script
 */

let classDistributionChart;
let genderDistributionChart;

/**
 * Initialize the dashboard
 */
function initDashboard() {
    console.log('Initializing dashboard...');
    
    // Update dashboard statistics
    updateDashboardStats();
    
    // Create charts
    createCharts();
    
    // Setup event listeners
    setupDashboardEventListeners();
    
    // Load recent activities (mock data for now)
    loadRecentActivities();
    
    // Load upcoming birthdays from student data
    loadUpcomingBirthdays();
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    // Get all students
    const students = getAllStudents();
    
    // Update total students count
    const totalStudentsEl = document.getElementById('total-students');
    if (totalStudentsEl) {
        totalStudentsEl.textContent = students.length;
    }
    
    // Other stats would be retrieved from backend in a real application
    // For now, we'll use placeholder values
    
    // Count students by class for the chart
    const classCounts = {};
    const genderCounts = {
        'Male': 0,
        'Female': 0,
        'Other': 0
    };
    
    students.forEach(student => {
        // Count by class
        const classKey = student.admissionClass || 'Unknown';
        classCounts[classKey] = (classCounts[classKey] || 0) + 1;
        
        // Count by gender
        const gender = student.gender || 'Other';
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });
    
    return {
        classCounts,
        genderCounts
    };
}

/**
 * Create dashboard charts
 */
function createCharts() {
    const stats = updateDashboardStats();
    
    // Class Distribution Chart
    const classChartCtx = document.getElementById('class-distribution-chart');
    if (classChartCtx) {
        // Prepare data for class distribution chart
        const classLabels = Object.keys(stats.classCounts);
        const classData = Object.values(stats.classCounts);
        const classColors = generateChartColors(classLabels.length);
        
        classDistributionChart = new Chart(classChartCtx, {
            type: 'bar',
            data: {
                labels: classLabels,
                datasets: [{
                    label: 'Number of Students',
                    data: classData,
                    backgroundColor: classColors,
                    borderColor: classColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Students: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Gender Distribution Chart
    const genderChartCtx = document.getElementById('gender-distribution-chart');
    if (genderChartCtx) {
        // Prepare data for gender distribution chart
        const genderLabels = Object.keys(stats.genderCounts);
        const genderData = Object.values(stats.genderCounts);
        const genderColors = [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)'
        ];
        
        genderDistributionChart = new Chart(genderChartCtx, {
            type: 'doughnut',
            data: {
                labels: genderLabels,
                datasets: [{
                    data: genderData,
                    backgroundColor: genderColors,
                    borderColor: genderColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Generate array of colors for charts
 * @param {number} count - Number of colors to generate
 * @returns {Array} Array of color strings
 */
function generateChartColors(count) {
    const baseColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)',
        'rgba(210, 199, 199, 0.7)'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
}

/**
 * Setup dashboard event listeners
 */
function setupDashboardEventListeners() {
    // Example: Setup event listeners for dashboard actions
    const birthdayButtons = document.querySelectorAll('#upcoming-birthdays .btn');
    birthdayButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Handle send birthday card action
            const studentItem = e.target.closest('.list-group-item');
            const studentName = studentItem.querySelector('h6').textContent;
            showAlert(`Birthday card option selected for ${studentName}`, 'info');
            // In a real app, this would open the birthday card selection modal
        });
    });
}

/**
 * Load recent activities
 * In a real app, this would fetch from the backend
 */
function loadRecentActivities() {
    // For the frontend prototype, we'll use the existing sample data
    // In a real implementation, this would fetch from the backend API
}

/**
 * Load upcoming birthdays from student data
 */
function loadUpcomingBirthdays() {
    const birthdaysContainer = document.getElementById('upcoming-birthdays');
    if (!birthdaysContainer) return;
    
    // Get all students
    const students = getAllStudents();
    if (!students.length) {
        birthdaysContainer.innerHTML = `
            <div class="list-group-item text-center text-muted">
                <i class="fas fa-cake-candles fa-2x mb-2"></i>
                <p>No upcoming birthdays</p>
            </div>
        `;
        return;
    }
    
    // Filter and sort students with upcoming birthdays
    const today = new Date();
    const upcomingBirthdays = [];
    
    students.forEach(student => {
        if (!student.dateOfBirth) return;
        
        const dob = new Date(student.dateOfBirth);
        const birthMonth = dob.getMonth();
        const birthDay = dob.getDate();
        
        // Create a date for this year's birthday
        const thisYearBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
        
        // If birthday already passed this year, use next year's birthday
        if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        // Calculate days until birthday
        const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
        
        // Only include if it's within the next 30 days
        if (daysUntil <= 30) {
            upcomingBirthdays.push({
                ...student,
                daysUntil,
                birthdayDate: thisYearBirthday
            });
        }
    });
    
    // Sort by closest birthday
    upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
    
    // Take only the first 5 birthdays
    const displayBirthdays = upcomingBirthdays.slice(0, 5);
    
    // Render birthdays or show empty message
    if (displayBirthdays.length === 0) {
        birthdaysContainer.innerHTML = `
            <div class="list-group-item text-center text-muted">
                <i class="fas fa-cake-candles fa-2x mb-2"></i>
                <p>No upcoming birthdays in the next 30 days</p>
            </div>
        `;
    } else {
        birthdaysContainer.innerHTML = displayBirthdays.map(student => {
            const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim();
            const classSection = `${student.admissionClass || ''}-${student.section || ''}`;
            
            let birthdayLabel;
            if (student.daysUntil === 0) {
                birthdayLabel = '<small class="text-primary"><i class="fas fa-birthday-cake me-1"></i>Today</small>';
            } else if (student.daysUntil === 1) {
                birthdayLabel = '<small class="text-muted"><i class="fas fa-birthday-cake me-1"></i>Tomorrow</small>';
            } else {
                birthdayLabel = `<small class="text-muted"><i class="fas fa-birthday-cake me-1"></i>In ${student.daysUntil} days</small>`;
            }
            
            return `
                <div class="list-group-item" data-student-id="${student.id}">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${fullName}</h6>
                        ${birthdayLabel}
                    </div>
                    <p class="mb-1">Class ${classSection} <button class="btn btn-sm btn-outline-primary float-end">Send Card</button></p>
                </div>
            `;
        }).join('');
    }
}