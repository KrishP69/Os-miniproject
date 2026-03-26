# Deadlock Detection Web App

A simple Operating Systems mini-project to detect whether a system is in a deadlock state using the Banker's safety check logic.

This project provides:
- A landing page with project overview
- A detector page to enter process/resource data
- Deadlock or safe-state result
- Remaining resource calculation
- Safe sequence display (when available)

## Designed By
Krish Patil

## Project Structure
- `index.html` - Home page with project intro and link to detector
- `detector.html` - Input form and result dashboard
- `style.css` - UI styling and responsive layout
- `script.js` - Deadlock detection logic and dynamic input generation

## How To Run
1. Open the project folder.
2. Double-click `index.html` or run it with Live Server.
3. Click **Open Deadlock Detector**.
4. Enter:
	- Number of processes
	- Number of resource types
5. Click **Generate Input Fields**.
6. Fill all inputs:
	- Allocation Matrix
	- Maximum Matrix
	- Available Resources
7. Click **Analyze for Deadlock**.

## Input Details
- Process labels are `P0`, `P1`, `P2`, ...
- Resource labels are `R0`, `R1`, `R2`, ...
- All values must be non-negative integers.

Matrix meaning:
- Allocation[i][j]: resources of type j currently assigned to process i
- Maximum[i][j]: maximum resources of type j process i may need
- Need[i][j] = Maximum[i][j] - Allocation[i][j]

## Output Details
After analysis, the app shows:
- System status:
  - `SYSTEM IS IN SAFE STATE - NO DEADLOCK`
  - or `SYSTEM IS IN DEADLOCK STATE`
- Safe sequence (if safe), for example: `P1 -> P0 -> P2`
- Deadlocked processes (if deadlock exists)
- Remaining resources after simulated completion
- Per-process details: Allocation, Maximum, Need, and status

## Algorithm Used
The project uses a Banker's safety-state style simulation:
1. Compute `Need = Maximum - Allocation`.
2. Start with `Work = Available`.
3. Repeatedly find an unfinished process whose `Need <= Work`.
4. If found, mark it complete and release its allocated resources into `Work`.
5. If no such process is found while some are unfinished, deadlock is reported.

## Example Test Case
Try this sample to see a safe state:

- Processes: `3`
- Resources: `3`

Allocation:
- P0: `0 1 0`
- P1: `2 0 0`
- P2: `3 0 2`

Maximum:
- P0: `7 5 3`
- P1: `3 2 2`
- P2: `9 0 2`

Available:
- `3 3 2`

## Notes
- This is a front-end only project (HTML/CSS/JavaScript).
- No backend or database is required.
- Best viewed in modern browsers (Chrome, Edge, Firefox).
