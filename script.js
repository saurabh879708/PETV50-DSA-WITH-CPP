// Global Variables
let students = JSON.parse(localStorage.getItem('scholarshipStudents')) || [];
let criteria = JSON.parse(localStorage.getItem('scholarshipCriteria')) || {
    marks: 40,
    income: 30,
    category: 10,
    extracurricular: 10,
    numScholarships: 5,
    minMarks: 60,
    maxIncome: 800000,
    rankWeight: 10
};

let currentSection = 'home';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupThemeToggle();
    setupFormHandlers();
    setupCSVUpload();
    setupAllocationHandlers();
    setupSearchAndFilters();
    setupExportHandlers();
    updateStudentCount();
    updateCriteriaPreview();
    updateAllocationSummary();
    updateResultsSummary();
    
    // Load data based on current page
    const currentPage = getCurrentPage();
    if (currentPage === 'data-input') {
        renderStudentsTable();
    } else if (currentPage === 'criteria') {
        setupSliders();
    } else if (currentPage === 'allocation') {
        renderAllocationTable([]);
    } else if (currentPage === 'results') {
        renderResultsTable();
        renderCharts();
    }
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('data-input')) return 'data-input';
    if (path.includes('criteria')) return 'criteria';
    if (path.includes('allocation')) return 'allocation';
    if (path.includes('results')) return 'results';
    return 'home';
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
        });
    });

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Get Started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            window.location.href = 'data-input.html';
        });
    }
}

// Theme Toggle
function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle?.querySelector('i');
    
    if (!themeToggle || !icon) return;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(icon, savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(icon, newTheme);
    });
}

function updateThemeIcon(icon, theme) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Form Handlers
function setupFormHandlers() {
    // Student Form
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentSubmit);
    }

    // Criteria Form
    const criteriaForm = document.getElementById('criteriaForm');
    if (criteriaForm) {
        criteriaForm.addEventListener('submit', handleCriteriaSubmit);
        setupSliders();
    }
}

function handleStudentSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const student = {
        id: Date.now(), // Unique ID for deletion
        name: formData.get('name'),
        roll: formData.get('roll'),
        email: formData.get('email'),
        gender: formData.get('gender'),
        category: formData.get('category'),
        income: parseFloat(formData.get('income')),
        marks: parseFloat(formData.get('marks')),
        rank: parseInt(formData.get('rank')),
        extracurricular: parseFloat(formData.get('extracurricular'))
    };

    students.push(student);
    saveStudentsToStorage();
    renderStudentsTable();
    updateStudentCount();
    form.reset();
    
    showNotification('Student added successfully!', 'success');
}

function handleCriteriaSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    criteria = {
        marks: parseFloat(formData.get('marks')),
        income: parseFloat(formData.get('income')),
        category: parseFloat(formData.get('category')),
        extracurricular: parseFloat(formData.get('extracurricular')),
        numScholarships: parseInt(formData.get('numScholarships')),
        minMarks: parseFloat(formData.get('minMarks')),
        maxIncome: parseFloat(formData.get('maxIncome')),
        rankWeight: parseFloat(formData.get('rankWeight'))
    };

    saveCriteriaToStorage();
    updateCriteriaPreview();
    showNotification('Criteria saved successfully!', 'success');
}

function setupSliders() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        // Set initial values from criteria
        const name = slider.getAttribute('name');
        if (criteria[name] !== undefined) {
            slider.value = criteria[name];
            const target = slider.getAttribute('data-target');
            if (target) {
                document.getElementById(target).textContent = criteria[name] + '%';
            }
        }
        
        slider.addEventListener('input', (e) => {
            const target = e.target.getAttribute('data-target');
            const value = e.target.value;
            if (target) {
                document.getElementById(target).textContent = value + '%';
            }
            updateCriteriaPreview();
        });
    });
}

// CSV Upload
function setupCSVUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const csvInput = document.getElementById('csvInput');
    const downloadSampleBtn = document.getElementById('downloadSample');

    // Upload zone click
    if (uploadZone) {
        uploadZone.addEventListener('click', () => {
            csvInput.click();
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--primary-color)';
            uploadZone.style.background = 'var(--bg-tertiary)';
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border-color)';
            uploadZone.style.background = 'transparent';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border-color)';
            uploadZone.style.background = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleCSVFile(files[0]);
            }
        });
    }

    // File input change
    if (csvInput) {
        csvInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleCSVFile(e.target.files[0]);
            }
        });
    }

    // Download sample
    if (downloadSampleBtn) {
        downloadSampleBtn.addEventListener('click', downloadSampleCSV);
    }
}

function handleCSVFile(file) {
    if (!file.name.endsWith('.csv')) {
        showNotification('Please upload a CSV file!', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        
        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const columns = line.split(',').map(col => col.trim());
                if (columns.length >= 9) {
                    const student = {
                        id: Date.now() + i,
                        name: columns[0],
                        roll: columns[1],
                        email: columns[2],
                        gender: columns[3],
                        category: columns[4],
                        income: parseFloat(columns[5]) || 0,
                        marks: parseFloat(columns[6]) || 0,
                        rank: parseInt(columns[7]) || 0,
                        extracurricular: parseFloat(columns[8]) || 0
                    };
                    students.push(student);
                }
            }
        }
        
        saveStudentsToStorage();
        renderStudentsTable();
        updateStudentCount();
        showNotification(`${students.length} students imported successfully!`, 'success');
    };
    
    reader.readAsText(file);
}

function downloadSampleCSV() {
    const sampleData = `name,roll,email,gender,category,income,marks,rank,extracurricular
John Doe,101,john@example.com,Male,General,50000,92,1,8
Jane Smith,102,jane@example.com,Female,SC,30000,88,2,7
Mike Johnson,103,mike@example.com,Male,OBC,45000,85,3,6`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_students.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Table Rendering
function renderStudentsTable() {
    const tbody = document.querySelector('#studentsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.roll}</td>
            <td>${student.email}</td>
            <td>${student.gender}</td>
            <td>${student.category}</td>
            <td>₹${student.income.toLocaleString()}</td>
            <td>${student.marks}%</td>
            <td>${student.rank}</td>
            <td>${student.extracurricular}/10</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteStudent(id) {
    students = students.filter(s => s.id !== id);
    saveStudentsToStorage();
    renderStudentsTable();
    updateStudentCount();
    showNotification('Student deleted successfully!', 'success');
}

function updateStudentCount() {
    const countElement = document.getElementById('studentCount');
    if (countElement) {
        countElement.textContent = `${students.length} students`;
    }
}

// Criteria Preview
function updateCriteriaPreview() {
    const totalWeightage = criteria.marks + criteria.income + criteria.category + criteria.extracurricular;
    const scholarshipsAvailable = criteria.numScholarships;
    const eligibilityRange = `${criteria.minMarks}% - 100% marks, ≤₹${criteria.maxIncome.toLocaleString()} income`;
    
    const totalWeightageEl = document.getElementById('totalWeightage');
    const scholarshipsAvailableEl = document.getElementById('scholarshipsAvailable');
    const eligibilityRangeEl = document.getElementById('eligibilityRange');
    
    if (totalWeightageEl) totalWeightageEl.textContent = totalWeightage + '%';
    if (scholarshipsAvailableEl) scholarshipsAvailableEl.textContent = scholarshipsAvailable;
    if (eligibilityRangeEl) eligibilityRangeEl.textContent = eligibilityRange;
}

// Allocation Handlers
function setupAllocationHandlers() {
    const startAllocationBtn = document.getElementById('startAllocation');
    const resetAllocationBtn = document.getElementById('resetAllocation');

    if (startAllocationBtn) {
        startAllocationBtn.addEventListener('click', startAllocation);
    }

    if (resetAllocationBtn) {
        resetAllocationBtn.addEventListener('click', resetAllocation);
    }
}

function startAllocation() {
    if (students.length === 0) {
        showNotification('No students to allocate!', 'error');
        return;
    }

    // Calculate scores
    students.forEach(student => {
        student.score = calculateScore(student);
        student.status = 'Not Selected';
    });

    // Filter eligible students
    let eligible = students.filter(student => 
        student.marks >= criteria.minMarks && 
        student.income <= criteria.maxIncome
    );

    // Sort by score
    eligible.sort((a, b) => b.score - a.score);

    // Update summary
    updateAllocationSummary(eligible);

    // Animate allocation
    animateAllocation(eligible);
}

function calculateScore(student) {
    const marksScore = (student.marks / 100) * criteria.marks;
    const incomeScore = (1 - student.income / criteria.maxIncome) * criteria.income;
    const rankScore = (1 / student.rank) * criteria.rankWeight;
    const extraScore = (student.extracurricular / 10) * criteria.extracurricular;
    
    // Category bonus
    let categoryScore = 0;
    if (student.category === 'SC') categoryScore = 5;
    else if (student.category === 'ST') categoryScore = 7;
    else if (student.category === 'OBC') categoryScore = 3;
    
    return marksScore + incomeScore + rankScore + extraScore + categoryScore;
}

function animateAllocation(eligible) {
    const total = Math.min(criteria.numScholarships, eligible.length);
    let allocated = 0;
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    function step() {
        if (allocated < total) {
            eligible[allocated].status = 'Allocated';
            renderAllocationTable(eligible);
            
            allocated++;
            const percentage = (allocated / total) * 100;
            
            if (progressFill) progressFill.style.width = percentage + '%';
            if (progressText) progressText.textContent = `Allocating scholarship ${allocated} of ${total}`;
            if (progressPercent) progressPercent.textContent = Math.round(percentage) + '%';
            
            setTimeout(step, 800);
        } else {
            if (progressText) progressText.textContent = 'Allocation complete!';
            if (progressPercent) progressPercent.textContent = '100%';
            
            // Save results and show view results button
            saveStudentsToStorage();
            const viewResultsBtn = document.getElementById('viewResultsBtn');
            if (viewResultsBtn) {
                viewResultsBtn.style.display = 'inline-flex';
            }
        }
    }
    
    step();
}

function renderAllocationTable(data) {
    const tbody = document.querySelector('#allocationTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.forEach((student, index) => {
        const row = document.createElement('tr');
        row.style.background = student.status === 'Allocated' ? 'var(--success-color)' : 'transparent';
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.roll}</td>
            <td>${student.score ? student.score.toFixed(2) : ''}</td>
            <td>
                <span class="status-badge ${student.status === 'Allocated' ? 'allocated' : 'not-allocated'}">
                    ${student.status}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function resetAllocation() {
    students.forEach(student => {
        student.status = 'Not Selected';
        delete student.score;
    });
    
    saveStudentsToStorage();
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = 'Ready to start';
    if (progressPercent) progressPercent.textContent = '0%';
    
    renderAllocationTable([]);
    updateAllocationSummary();
}

function updateAllocationSummary(eligible = []) {
    const totalStudents = students.length;
    const eligibleStudents = eligible.length || students.filter(s => s.marks >= criteria.minMarks && s.income <= criteria.maxIncome).length;
    const availableScholarships = criteria.numScholarships;
    const allocatedCount = students.filter(s => s.status === 'Allocated').length;
    
    const totalStudentsEl = document.getElementById('totalStudents');
    const eligibleStudentsEl = document.getElementById('eligibleStudents');
    const availableScholarshipsEl = document.getElementById('availableScholarships');
    const allocatedCountEl = document.getElementById('allocatedCount');
    
    if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
    if (eligibleStudentsEl) eligibleStudentsEl.textContent = eligibleStudents;
    if (availableScholarshipsEl) availableScholarshipsEl.textContent = availableScholarships;
    if (allocatedCountEl) allocatedCountEl.textContent = allocatedCount;
}

// Search and Filters
function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterResults);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterResults);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterResults);
    }
}

function filterResults() {
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';

    const filtered = students.filter(student => {
        const matchesSearch = 
            student.name.toLowerCase().includes(searchQuery) ||
            student.roll.toLowerCase().includes(searchQuery) ||
            student.category.toLowerCase().includes(searchQuery);
        
        const matchesStatus = !statusFilter || student.status === statusFilter;
        const matchesCategory = !categoryFilter || student.category === categoryFilter;
        
        return matchesSearch && matchesStatus && matchesCategory;
    });

    renderResultsTable(filtered);
}

function renderResultsTable(data = students) {
    const tbody = document.querySelector('#resultsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.forEach((student, index) => {
        const row = document.createElement('tr');
        row.style.background = student.status === 'Allocated' ? 'var(--success-color)' : 'transparent';
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.roll}</td>
            <td>${student.category}</td>
            <td>₹${student.income.toLocaleString()}</td>
            <td>${student.marks}%</td>
            <td>${student.score ? student.score.toFixed(2) : ''}</td>
            <td>
                <span class="status-badge ${student.status === 'Allocated' ? 'allocated' : 'not-allocated'}">
                    ${student.status || 'Not Selected'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateResultsSummary(data);
}

function updateResultsSummary(data = students) {
    const totalStudents = data.length;
    const allocatedStudents = data.filter(s => s.status === 'Allocated').length;
    const successRate = totalStudents > 0 ? Math.round((allocatedStudents / totalStudents) * 100) : 0;
    const averageScore = data.length > 0 ? 
        (data.reduce((sum, s) => sum + (s.score || 0), 0) / data.length).toFixed(2) : 0;
    
    const totalStudentsCountEl = document.getElementById('totalStudentsCount');
    const allocatedStudentsCountEl = document.getElementById('allocatedStudentsCount');
    const successRateEl = document.getElementById('successRate');
    const averageScoreEl = document.getElementById('averageScore');
    
    if (totalStudentsCountEl) totalStudentsCountEl.textContent = totalStudents;
    if (allocatedStudentsCountEl) allocatedStudentsCountEl.textContent = allocatedStudents;
    if (successRateEl) successRateEl.textContent = successRate + '%';
    if (averageScoreEl) averageScoreEl.textContent = averageScore;
}

// Charts
function renderCharts() {
    renderCategoryPie();
    renderIncomeBar();
    renderScoreLine();
}

function renderCategoryPie() {
    const allocated = students.filter(s => s.status === 'Allocated');
    const categories = {};
    
    allocated.forEach(s => {
        categories[s.category] = (categories[s.category] || 0) + 1;
    });

    const ctx = document.getElementById('categoryPie');
    if (!ctx) return;

    if (window.categoryPieChart) {
        window.categoryPieChart.destroy();
    }

    window.categoryPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderIncomeBar() {
    const allocated = students.filter(s => s.status === 'Allocated');
    const incomeRanges = {
        '0-1L': 0,
        '1L-2L': 0,
        '2L-5L': 0,
        '5L+': 0
    };

    allocated.forEach(s => {
        const inc = s.income;
        if (inc < 100000) incomeRanges['0-1L']++;
        else if (inc < 200000) incomeRanges['1L-2L']++;
        else if (inc < 500000) incomeRanges['2L-5L']++;
        else incomeRanges['5L+']++;
    });

    const ctx = document.getElementById('incomeBar');
    if (!ctx) return;

    if (window.incomeBarChart) {
        window.incomeBarChart.destroy();
    }

    window.incomeBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(incomeRanges),
            datasets: [{
                label: 'Scholarships',
                data: Object.values(incomeRanges),
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderScoreLine() {
    const sorted = [...students].sort((a, b) => b.score - a.score);
    const scores = sorted.map(s => s.score || 0);
    const status = sorted.map(s => s.status === 'Allocated' ? 1 : 0);

    const ctx = document.getElementById('scoreLine');
    if (!ctx) return;

    if (window.scoreLineChart) {
        window.scoreLineChart.destroy();
    }

    window.scoreLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: scores.map((_, i) => i + 1),
            datasets: [{
                label: 'Score',
                data: scores,
                borderColor: '#10b981',
                fill: false,
                tension: 0.2
            }, {
                label: 'Allocated',
                data: status,
                borderColor: '#ef4444',
                fill: false,
                stepped: true,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                },
                y1: {
                    position: 'right',
                    min: 0,
                    max: 1,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Export Handlers
function setupExportHandlers() {
    const exportCSVBtn = document.getElementById('exportCSV');
    const exportPDFBtn = document.getElementById('exportPDF');
    const printResultsBtn = document.getElementById('printResults');

    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', exportToCSV);
    }

    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportToPDF);
    }

    if (printResultsBtn) {
        printResultsBtn.addEventListener('click', printResults);
    }
}

function exportToCSV() {
    const allocated = students.filter(s => s.status === 'Allocated');
    const csvContent = [
        'Name,Roll,Email,Category,Income,Marks,Score,Status',
        ...allocated.map(s => 
            `${s.name},${s.roll},${s.email},${s.category},${s.income},${s.marks},${s.score?.toFixed(2) || ''},${s.status}`
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scholarship_results.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Results exported to CSV!', 'success');
}

function exportToPDF() {
    // Simple PDF export using window.print for now
    // In a real app, you'd use a library like jsPDF
    window.print();
    showNotification('Print dialog opened!', 'success');
}

function printResults() {
    window.print();
}

// Storage Functions
function saveStudentsToStorage() {
    localStorage.setItem('scholarshipStudents', JSON.stringify(students));
}

function saveCriteriaToStorage() {
    localStorage.setItem('scholarshipCriteria', JSON.stringify(criteria));
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-md) var(--spacing-lg);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        animation: slideIn 0.3s ease-out;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-success { border-left: 4px solid var(--success-color); }
        .notification-error { border-left: 4px solid var(--danger-color); }
        .notification-info { border-left: 4px solid var(--primary-color); }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add status badge styles
const statusStyles = document.createElement('style');
statusStyles.textContent = `
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    .status-badge.allocated {
        background: var(--success-color);
        color: white;
    }
    .status-badge.not-allocated {
        background: var(--text-muted);
        color: white;
    }
    .btn-sm {
        padding: 4px 8px;
        font-size: 0.75rem;
    }
`;
document.head.appendChild(statusStyles);
