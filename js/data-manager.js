
// Data Manager for School Management System

const DATA_KEYS = {
    STUDENTS: 'students',
    TEACHERS: 'teachers', 
    CLASSES: 'classes',
    NOTIFICATIONS: 'notifications',
    PROFILES: 'profiles',
    INITIALIZED: 'data_initialized'
};

// Initialize default data
function initializeDefaultData() {
    // Check if data is already initialized
    if (localStorage.getItem(DATA_KEYS.INITIALIZED) === 'true') {
        return;
    }

    // Generate 400 students (40 per section)
    const classes = ['IX', 'X', 'XI', 'XII'];
    const sections = ['A', 'B'];
    let students = [];
    let currentRoll = 1000;
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

    classes.forEach(className => {
        sections.forEach(section => {
            for(let i = 0; i < 40; i++) {
                currentRoll++;
                const studentId = generateUniqueId();
                students.push({
                    id: studentId,
                    rollNo: `${className}${section}${currentRoll}`,
                    firstName: `Student${currentRoll}`,
                    lastName: `LastName${currentRoll}`,
                    admissionClass: className,
                    section: section,
                    dateOfBirth: randomDate(2005, 2010),
                    gender: i % 2 === 0 ? 'Male' : 'Female',
                    bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
                    address: `${Math.floor(Math.random() * 1000) + 1} ${cities[Math.floor(Math.random() * cities.length)]}`,
                    contactNumber: `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
                    email: `student${currentRoll}@school.com`,
                    fatherName: `Father${currentRoll}`,
                    motherName: `Mother${currentRoll}`,
                    parentContact: `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
                    status: 'Active',
                    attendance: generateRandomAttendance(),
                    marks: generateRandomMarks(subjects),
                    fees: generateRandomFees(),
                    profilePhoto: null,
                    admissionDate: new Date().toISOString()
                });
            }
        });
    });

    // Generate 40 teachers
    let teachers = [];
    let currentEmpId = 2000;

    for(let i = 0; i < 40; i++) {
        currentEmpId++;
        const teacherId = `T${currentEmpId}`;
        teachers.push({
            id: teacherId,
            employeeId: currentEmpId,
            name: `Teacher${currentEmpId}`,
            type: 'teacher',
            username: `teacher${currentEmpId}`,
            password: 'teacher123',
            email: `teacher${currentEmpId}@school.com`,
            phone: `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
            subjects: [subjects[i % subjects.length]],
            assignedClasses: [classes[i % classes.length] + sections[i % sections.length]],
            qualification: 'M.Ed.',
            experience: Math.floor(Math.random() * 15) + 1,
            status: 'Active',
            address: `${Math.floor(Math.random() * 1000) + 1} ${cities[Math.floor(Math.random() * cities.length)]}`,
            joinDate: randomDate(2015, 2023)
        });
    }

    // Initialize notifications
    const notifications = [
        {
            id: generateUniqueId(),
            title: 'Welcome to New Session',
            message: 'Academic session 2024-25 has begun',
            date: new Date().toISOString(),
            type: 'general'
        }
    ];

    // Initialize classes with proper data
    const classesData = classes.flatMap(className => 
        sections.map(section => ({
            id: generateUniqueId(),
            name: className,
            section: section,
            room: `${className}${section}`,
            teacherId: teachers[Math.floor(Math.random() * teachers.length)].id,
            subjects: subjects.slice(0, 5),
            timetable: generateTimetable(subjects.slice(0, 5)),
            description: `${className} grade section ${section}`,
            createdAt: new Date().toISOString()
        }))
    );

    // Save all data
    localStorage.setItem(DATA_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(DATA_KEYS.TEACHERS, JSON.stringify(teachers));
    localStorage.setItem(DATA_KEYS.CLASSES, JSON.stringify(classesData));
    localStorage.setItem(DATA_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    localStorage.setItem(DATA_KEYS.INITIALIZED, 'true');
}

// Helper functions
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function randomDate(startYear, endYear) {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function generateRandomAttendance() {
    const total = 200;
    const present = Math.floor(Math.random() * 40) + 160;
    return {
        total,
        present,
        absent: total - present
    };
}

function generateRandomMarks(subjects) {
    return subjects.reduce((acc, subject) => {
        acc[subject] = {
            midterm: Math.floor(Math.random() * 41) + 60,
            final: Math.floor(Math.random() * 41) + 60
        };
        return acc;
    }, {});
}

function generateRandomFees() {
    const amount = 50000;
    const paid = Math.random() > 0.2 ? amount : Math.floor(Math.random() * amount);
    return {
        amount,
        paid,
        balance: amount - paid,
        lastPaid: randomDate(2023, 2024)
    };
}

function generateTimetable(subjects) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = ['8:00-9:00', '9:00-10:00', '10:15-11:15', '11:15-12:15', '1:00-2:00'];
    
    return days.map(day => ({
        day,
        schedule: periods.map((time, index) => ({
            time,
            subject: subjects[index % subjects.length]
        }))
    }));
}

// Data retrieval functions
function getAllStudents() {
    return JSON.parse(localStorage.getItem(DATA_KEYS.STUDENTS) || '[]');
}

function getAllTeachers() {
    return JSON.parse(localStorage.getItem(DATA_KEYS.TEACHERS) || '[]');
}

function getAllClasses() {
    return JSON.parse(localStorage.getItem(DATA_KEYS.CLASSES) || '[]');
}

function getAllNotifications() {
    return JSON.parse(localStorage.getItem(DATA_KEYS.NOTIFICATIONS) || '[]');
}

// Initialize data if not exists
if (!localStorage.getItem(DATA_KEYS.INITIALIZED)) {
    initializeDefaultData();
}
