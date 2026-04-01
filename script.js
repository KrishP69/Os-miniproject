// Theme Toggle Functionality
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        return;
    }

    // Default to dark mode on first visit.
    setTheme('dark');
}

function setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('☀️');
    } else {
        html.setAttribute('data-theme', 'light');
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
    const currentTheme = html.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
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

function setInvalidState(message) {
    const statusCard = document.getElementById('status-card');
    statusCard.classList.remove('safe');
    statusCard.classList.add('deadlock');
    statusCard.innerHTML = `Invalid Input: ${message}`;

    const cardsToHide = [
        'safe-sequence-card',
        'need-matrix-card',
        'stepwise-card',
        'deadlock-processes-card',
        'remaining-resources-card',
        'process-details-card',
        'request-option-card'
    ];

    cardsToHide.forEach((id) => {
        const card = document.getElementById(id);
        if (card) {
            card.style.display = 'none';
        }
    });
}

function parseNonNegativeInteger(value) {
    if (value === '' || value === null || value === undefined) {
        return { valid: false, number: 0 };
    }
    const number = Number(value);
    return {
        valid: Number.isInteger(number) && number >= 0,
        number
    };
}

function formatVector(vector) {
    return `[${vector.join(', ')}]`;
}

function setMatrixValues(matrixClassPrefix, matrixData) {
    for (let i = 0; i < matrixData.length; i++) {
        for (let j = 0; j < matrixData[i].length; j++) {
            const input = document.querySelector(`.${matrixClassPrefix}-${i}-${j}`);
            if (input) {
                input.value = matrixData[i][j];
            }
        }
    }
}

function setAvailableValues(values) {
    for (let j = 0; j < values.length; j++) {
        const input = document.querySelector(`.available-${j}`);
        if (input) {
            input.value = values[j];
        }
    }
}

function loadPreset(presetType) {
    let preset;

    if (presetType === 'safe') {
        preset = {
            processes: 3,
            resources: 3,
            allocation: [
                [1, 0, 1],
                [1, 1, 0],
                [1, 0, 0]
            ],
            maximum: [
                [2, 1, 1],
                [1, 2, 1],
                [3, 1, 1]
            ],
            available: [1, 1, 1]
        };
    } else if (presetType === 'unsafe') {
        preset = {
            processes: 3,
            resources: 3,
            allocation: [
                [1, 0, 0],
                [0, 1, 0],
                [1, 0, 1]
            ],
            maximum: [
                [1, 2, 1],
                [1, 1, 1],
                [2, 1, 1]
            ],
            available: [0, 0, 0]
        };
    } else if (presetType === 'invalid') {
        preset = {
            processes: 2,
            resources: 2,
            allocation: [
                [2, 1],
                [1, 0]
            ],
            maximum: [
                [1, 1],
                [1, 0]
            ],
            available: [1, 1]
        };
    } else {
        return;
    }

    document.getElementById('numProcesses').value = preset.processes;
    document.getElementById('numResources').value = preset.resources;

    generateMatrices();
    setMatrixValues('allocation', preset.allocation);
    setMatrixValues('maximum', preset.maximum);
    setAvailableValues(preset.available);

    document.getElementById('results-section').style.display = 'none';
}

function renderNeedMatrixTable(needMatrix) {
    let tableHTML = '<div class="table-wrap"><table class="need-table"><thead><tr><th>Process</th>';
    for (let j = 0; j < numResources; j++) {
        tableHTML += `<th>R${j}</th>`;
    }
    tableHTML += '</tr></thead><tbody>';

    for (let i = 0; i < numProcesses; i++) {
        tableHTML += `<tr><td>P${i}</td>`;
        for (let j = 0; j < numResources; j++) {
            tableHTML += `<td>${needMatrix[i][j]}</td>`;
        }
        tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table></div>';
    return tableHTML;
}

function setupRequestForm() {
    const processSelect = document.getElementById('request-process');
    const requestInputs = document.getElementById('request-vector-inputs');
    const requestContainer = document.getElementById('request-form-container');
    const requestResult = document.getElementById('request-result');

    if (!processSelect || !requestInputs || !requestContainer) {
        return;
    }

    processSelect.innerHTML = '';
    for (let i = 0; i < numProcesses; i++) {
        processSelect.innerHTML += `<option value="${i}">P${i}</option>`;
    }

    let requestHTML = '<div class="resource-input-group">';
    for (let j = 0; j < numResources; j++) {
        requestHTML += `<div class="resource-item">
            <label for="request-${j}">R${j}:</label>
            <input type="number" id="request-${j}" min="0" value="0">
        </div>`;
    }
    requestHTML += '</div>';
    requestInputs.innerHTML = requestHTML;

    requestContainer.style.display = 'none';
    if (requestResult) {
        requestResult.innerHTML = '';
    }

    const requestChoices = document.querySelectorAll('input[name="wantsRequest"]');
    requestChoices.forEach((choice) => {
        choice.onchange = () => {
            if (choice.value === 'yes' && choice.checked) {
                requestContainer.style.display = 'block';
            }
            if (choice.value === 'no' && choice.checked) {
                requestContainer.style.display = 'none';
                if (requestResult) {
                    requestResult.innerHTML = '';
                }
            }
        };
    });
}

// Generate input matrices based on process and resource count
function generateMatrices() {
    numProcesses = parseInt(document.getElementById('numProcesses').value);
    numResources = parseInt(document.getElementById('numResources').value);

    if (!Number.isInteger(numProcesses) || !Number.isInteger(numResources) || numProcesses < 1 || numResources < 1) {
        alert('Please enter valid positive integer values for number of processes and resources.');
        return;
    }

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

    setupRequestForm();
}

// Read input values from UI
function readInputValues() {
    // Read allocation matrix
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            const allocationInput = document.querySelector(`.allocation-${i}-${j}`);
            const parsedAllocation = parseNonNegativeInteger(allocationInput.value);
            if (!parsedAllocation.valid) {
                return { valid: false, message: `Allocation value at P${i}, R${j} is invalid.` };
            }
            allocation[i][j] = parsedAllocation.number;
        }
    }

    // Read maximum matrix
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            const maximumInput = document.querySelector(`.maximum-${i}-${j}`);
            const parsedMaximum = parseNonNegativeInteger(maximumInput.value);
            if (!parsedMaximum.valid) {
                return { valid: false, message: `Maximum value at P${i}, R${j} is invalid.` };
            }
            maximum[i][j] = parsedMaximum.number;
        }
    }

    // Read available resources
    for (let j = 0; j < numResources; j++) {
        const availableInput = document.querySelector(`.available-${j}`);
        const parsedAvailable = parseNonNegativeInteger(availableInput.value);
        if (!parsedAvailable.valid) {
            return { valid: false, message: `Available resource value for R${j} is invalid.` };
        }
        available[j] = parsedAvailable.number;
    }

    return { valid: true, message: '' };
}

// Calculate Need matrix (Maximum - Allocation)
function calculateNeed(allocationMatrix = allocation, maximumMatrix = maximum) {
    const need = Array(numProcesses).fill(null).map(() => Array(numResources).fill(0));
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            need[i][j] = maximumMatrix[i][j] - allocationMatrix[i][j];
        }
    }
    return need;
}

// Banker's Algorithm - Safety Check
function isSafeState(allocationMatrix = allocation, maximumMatrix = maximum, availableVector = available) {
    const need = calculateNeed(allocationMatrix, maximumMatrix);
    const work = [...availableVector];
    const finish = Array(numProcesses).fill(false);
    const safeSequence = [];
    const steps = [];

    // Validate input: Maximum must be >= Allocation for every entry.
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            if (maximumMatrix[i][j] < allocationMatrix[i][j]) {
                return {
                    valid: false,
                    message: `Maximum at P${i}, R${j} is smaller than Allocation.`,
                    safe: false,
                    safeSequence: [],
                    unfinishedProcesses: [],
                    work,
                    finish,
                    steps,
                    need
                };
            }
        }
    }

    steps.push(`Initial Available (Work): ${formatVector(work)}`);

    let finishedCount = 0;
    let progressed;
    let pass = 1;

    // Repeatedly scan all unfinished processes until no new process can run.
    do {
        progressed = false;
        steps.push(`Pass ${pass}: scanning unfinished processes.`);

        for (let i = 0; i < numProcesses; i++) {
            if (finish[i]) {
                continue;
            }

            let canExecute = true;
            // Process can run only if Need[i] <= Available(work).
            for (let j = 0; j < numResources; j++) {
                if (need[i][j] > work[j]) {
                    canExecute = false;
                    break;
                }
            }

            if (canExecute) {
                steps.push(
                    `P${i} can execute because Need ${formatVector(need[i])} <= Work ${formatVector(work)}.`
                );
                // Release allocated resources after process execution.
                for (let j = 0; j < numResources; j++) {
                    work[j] += allocationMatrix[i][j];
                }
                finish[i] = true;
                safeSequence.push(i);
                finishedCount++;
                progressed = true;
                steps.push(`After completing P${i}, Work becomes ${formatVector(work)}.`);
            } else {
                steps.push(
                    `P${i} cannot execute now because Need ${formatVector(need[i])} is not <= Work ${formatVector(work)}.`
                );
            }
        }
        pass++;
    } while (progressed && finishedCount < numProcesses);

    const unfinishedProcesses = [];
    for (let i = 0; i < numProcesses; i++) {
        if (!finish[i]) {
            unfinishedProcesses.push(i);
        }
    }

    if (finishedCount === numProcesses) {
        steps.push(`All processes can finish. Safe sequence is ${safeSequence.map((p) => `P${p}`).join(' -> ')}.`);
    } else {
        steps.push(
            `No further process can execute. Unfinished processes: ${unfinishedProcesses.map((p) => `P${p}`).join(', ')}.`
        );
    }

    return {
        valid: true,
        message: finishedCount === numProcesses ? 'SAFE STATE' : 'System is in unsafe state',
        safe: finishedCount === numProcesses,
        safeSequence,
        unfinishedProcesses,
        work,
        finish,
        steps,
        need
    };
}

// Analyze for deadlock
function analyzeDeadlock() {
    const inputCheck = readInputValues();

    // Show results section
    document.getElementById('results-section').style.display = 'block';

    if (!inputCheck.valid) {
        setInvalidState(inputCheck.message);
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    const result = isSafeState();
    const needMatrix = result.need;

    // Status card
    const statusCard = document.getElementById('status-card');
    if (!result.valid) {
        setInvalidState(result.message);
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    if (result.safe) {
        statusCard.classList.remove('deadlock');
        statusCard.classList.add('safe');
        statusCard.innerHTML = '✓ SYSTEM IS IN SAFE STATE - NO DEADLOCK';
    } else {
        statusCard.classList.remove('safe');
        statusCard.classList.add('deadlock');
        statusCard.innerHTML = 'System is in unsafe state';
    }

    // Safe sequence
    if (result.safe) {
        document.getElementById('safe-sequence-card').style.display = 'block';
        const sequence = result.safeSequence.map(p => `P${p}`).join(' → ');
        document.getElementById('safe-sequence').textContent = sequence;
    } else {
        document.getElementById('safe-sequence-card').style.display = 'none';
    }

    // Need matrix in table form
    document.getElementById('need-matrix-card').style.display = 'block';
    document.getElementById('need-matrix').innerHTML = renderNeedMatrixTable(needMatrix);

    // Step-wise solution
    document.getElementById('stepwise-card').style.display = 'block';
    document.getElementById('stepwise-solution').innerHTML = result.steps
        .map((step) => `<li>${step}</li>`)
        .join('');

    // Unfinished processes in unsafe state
    if (!result.safe && result.unfinishedProcesses.length > 0) {
        document.getElementById('deadlock-processes-card').style.display = 'block';
        const deadlockedStr = result.unfinishedProcesses.map(p => `P${p}`).join(', ');
        document.getElementById('deadlock-processes').textContent = 
            `System is in unsafe state. Unfinished processes: ${deadlockedStr}.`;
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
            : (result.unfinishedProcesses.includes(i) ? '◐ Unfinished' : '✓ Completed');
        
        detailsHTML += `<div class="process-item">
            <strong>Process P${i}:</strong><br>
            Allocation: [${alloc}] | Maximum: [${max}] | Need: [${need}] | Status: ${status}
        </div>`;
    }
    document.getElementById('process-details').innerHTML = detailsHTML;

    // Optional additional request flow
    document.getElementById('request-option-card').style.display = 'block';
    setupRequestForm();

    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

function evaluateAdditionalRequest() {
    const wantsRequest = document.querySelector('input[name="wantsRequest"]:checked');
    const requestResult = document.getElementById('request-result');

    if (!wantsRequest || wantsRequest.value !== 'yes') {
        if (requestResult) {
            requestResult.innerHTML = '<p>No additional process request selected.</p>';
        }
        return;
    }

    const processSelect = document.getElementById('request-process');
    const processIndex = Number(processSelect.value);

    if (!Number.isInteger(processIndex) || processIndex < 0 || processIndex >= numProcesses) {
        requestResult.innerHTML = '<p class="request-invalid">Invalid process selected.</p>';
        return;
    }

    const requestVector = [];
    for (let j = 0; j < numResources; j++) {
        const requestInput = document.getElementById(`request-${j}`);
        const parsedRequest = parseNonNegativeInteger(requestInput.value);
        if (!parsedRequest.valid) {
            requestResult.innerHTML = `<p class="request-invalid">Invalid request value for R${j}. Only non-negative integers are allowed.</p>`;
            return;
        }
        requestVector.push(parsedRequest.number);
    }

    const need = calculateNeed();

    for (let j = 0; j < numResources; j++) {
        if (requestVector[j] > need[processIndex][j]) {
            requestResult.innerHTML = `<p class="request-invalid">Invalid request: Requested ${requestVector[j]} of R${j} exceeds Need ${need[processIndex][j]} for P${processIndex}.</p>`;
            return;
        }
        if (requestVector[j] > available[j]) {
            requestResult.innerHTML = `<p class="request-invalid">Request cannot be granted now: Requested ${requestVector[j]} of R${j} exceeds Available ${available[j]}.</p>`;
            return;
        }
    }

    const trialAllocation = allocation.map((row) => [...row]);
    const trialAvailable = [...available];

    for (let j = 0; j < numResources; j++) {
        trialAvailable[j] -= requestVector[j];
        trialAllocation[processIndex][j] += requestVector[j];
    }

    const safetyAfterRequest = isSafeState(trialAllocation, maximum, trialAvailable);

    if (!safetyAfterRequest.valid) {
        requestResult.innerHTML = `<p class="request-invalid">Invalid request state: ${safetyAfterRequest.message}</p>`;
        return;
    }

    if (safetyAfterRequest.safe) {
        requestResult.innerHTML = `
            <p class="request-safe">Request can be granted safely for P${processIndex}.</p>
            <p>Safe sequence after request: ${safetyAfterRequest.safeSequence.map((p) => `P${p}`).join(' -> ')}</p>
        `;
    } else {
        requestResult.innerHTML = `
            <p class="request-invalid">Request cannot be granted because it makes the system unsafe.</p>
            <p>Unfinished processes after trial: ${safetyAfterRequest.unfinishedProcesses.map((p) => `P${p}`).join(', ')}</p>
        `;
    }
}

// Reset form
function resetForm() {
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('matrices-container').style.display = 'none';
    document.getElementById('numProcesses').value = 3;
    document.getElementById('numResources').value = 3;
}
