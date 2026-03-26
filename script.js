// Theme Toggle Functionality
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('☀️');
    } else {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('🌙');
    }
}

function updateThemeIcon(icon) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = icon;
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Global variables
let numProcesses = 3;
let numResources = 3;
let allocation = [];
let maximum = [];
let available = [];

// Generate input matrices based on process and resource count
function generateMatrices() {
    numProcesses = parseInt(document.getElementById('numProcesses').value);
    numResources = parseInt(document.getElementById('numResources').value);

    // Initialize matrices
    allocation = Array(numProcesses).fill(null).map(() => Array(numResources).fill(0));
    maximum = Array(numProcesses).fill(null).map(() => Array(numResources).fill(0));
    available = Array(numResources).fill(0);

    // Generate allocation matrix
    let allocationHTML = '';
    for (let i = 0; i < numProcesses; i++) {
        allocationHTML += `<div class="matrix-row">
            <div class="matrix-label">P${i}</div>`;
        for (let j = 0; j < numResources; j++) {
            allocationHTML += `<input type="number" class="matrix-input allocation-${i}-${j}" min="0" value="0">`;
        }
        allocationHTML += `</div>`;
    }
    document.getElementById('allocationMatrix').innerHTML = allocationHTML;

    // Generate maximum matrix
    let maximumHTML = '';
    for (let i = 0; i < numProcesses; i++) {
        maximumHTML += `<div class="matrix-row">
            <div class="matrix-label">P${i}</div>`;
        for (let j = 0; j < numResources; j++) {
            maximumHTML += `<input type="number" class="matrix-input maximum-${i}-${j}" min="0" value="0">`;
        }
        maximumHTML += `</div>`;
    }
    document.getElementById('maximumMatrix').innerHTML = maximumHTML;

    // Generate available resources input
    let availableHTML = '<div class="resource-input-group">';
    for (let j = 0; j < numResources; j++) {
        availableHTML += `<div class="resource-item">
            <label for="available-${j}">R${j}:</label>
            <input type="number" id="available-${j}" class="available-${j}" min="0" value="0">
        </div>`;
    }
    availableHTML += '</div>';
    document.getElementById('availableResources').innerHTML = availableHTML;

    // Show matrices container
    document.getElementById('matrices-container').style.display = 'block';
}

// Read input values from UI
function readInputValues() {
    // Read allocation matrix
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            allocation[i][j] = parseInt(document.querySelector(`.allocation-${i}-${j}`).value) || 0;
        }
    }

    // Read maximum matrix
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            maximum[i][j] = parseInt(document.querySelector(`.maximum-${i}-${j}`).value) || 0;
        }
    }

    // Read available resources
    for (let j = 0; j < numResources; j++) {
        available[j] = parseInt(document.querySelector(`.available-${j}`).value) || 0;
    }
}

// Calculate Need matrix (Maximum - Allocation)
function calculateNeed() {
    const need = Array(numProcesses).fill(null).map(() => Array(numResources).fill(0));
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            need[i][j] = maximum[i][j] - allocation[i][j];
        }
    }
    return need;
}

// Banker's Algorithm - Safety Check
function isSafeState() {
    const need = calculateNeed();
    const work = [...available];
    const finish = Array(numProcesses).fill(false);
    const safeSequence = [];

    for (let count = 0; count < numProcesses; count++) {
        let found = false;

        for (let i = 0; i < numProcesses; i++) {
            if (!finish[i]) {
                let canAllocate = true;

                // Check if need[i] <= work
                for (let j = 0; j < numResources; j++) {
                    if (need[i][j] > work[j]) {
                        canAllocate = false;
                        break;
                    }
                }

                if (canAllocate) {
                    // Allocate resources
                    for (let j = 0; j < numResources; j++) {
                        work[j] += allocation[i][j];
                    }
                    finish[i] = true;
                    safeSequence.push(i);
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // Deadlock detected - return unfinished processes
            const deadlockedProcesses = [];
            for (let i = 0; i < numProcesses; i++) {
                if (!finish[i]) {
                    deadlockedProcesses.push(i);
                }
            }
            return { safe: false, safeSequence: [], deadlockedProcesses, work };
        }
    }

    return { safe: true, safeSequence, deadlockedProcesses: [], work };
}

// Analyze for deadlock
function analyzeDeadlock() {
    readInputValues();

    const result = isSafeState();
    const needMatrix = calculateNeed();

    // Show results section
    document.getElementById('results-section').style.display = 'block';

    // Status card
    const statusCard = document.getElementById('status-card');
    if (result.safe) {
        statusCard.classList.remove('deadlock');
        statusCard.classList.add('safe');
        statusCard.innerHTML = '✓ SYSTEM IS IN SAFE STATE - NO DEADLOCK';
    } else {
        statusCard.classList.remove('safe');
        statusCard.classList.add('deadlock');
        statusCard.innerHTML = '✗ SYSTEM IS IN DEADLOCK STATE';
    }

    // Safe sequence
    if (result.safe) {
        document.getElementById('safe-sequence-card').style.display = 'block';
        const sequence = result.safeSequence.map(p => `P${p}`).join(' → ');
        document.getElementById('safe-sequence').textContent = sequence;
    } else {
        document.getElementById('safe-sequence-card').style.display = 'none';
    }

    // Deadlock processes
    if (!result.safe && result.deadlockedProcesses.length > 0) {
        document.getElementById('deadlock-processes-card').style.display = 'block';
        const deadlockedStr = result.deadlockedProcesses.map(p => `P${p}`).join(', ');
        document.getElementById('deadlock-processes').textContent = 
            `Processes ${deadlockedStr} are in a deadlock state. These processes are waiting for resources that will never be released.`;
    } else {
        document.getElementById('deadlock-processes-card').style.display = 'none';
    }

    // Remaining resources
    document.getElementById('remaining-resources-card').style.display = 'block';
    let resourceHTML = '<div class="resource-display">';
    for (let j = 0; j < numResources; j++) {
        const resourceName = `R${j}`;
        const remaining = result.work[j];
        resourceHTML += `<div class="resource-item-display">
            <strong>${resourceName}:</strong> ${remaining}
        </div>`;
    }
    resourceHTML += '</div>';
    document.getElementById('remaining-resources').innerHTML = resourceHTML;

    // Process details
    document.getElementById('process-details-card').style.display = 'block';
    let detailsHTML = '';
    for (let i = 0; i < numProcesses; i++) {
        const alloc = allocation[i].join(', ');
        const max = maximum[i].join(', ');
        const need = needMatrix[i].join(', ');
        const status = result.safe 
            ? (result.safeSequence.includes(i) ? '✓ Safe' : '◐ Waiting')
            : (result.deadlockedProcesses.includes(i) ? '✗ Deadlocked' : '◐ Waiting');
        
        detailsHTML += `<div class="process-item">
            <strong>Process P${i}:</strong><br>
            Allocation: [${alloc}] | Maximum: [${max}] | Need: [${need}] | Status: ${status}
        </div>`;
    }
    document.getElementById('process-details').innerHTML = detailsHTML;

    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

// Reset form
function resetForm() {
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('matrices-container').style.display = 'none';
    document.getElementById('numProcesses').value = 3;
    document.getElementById('numResources').value = 3;
}
