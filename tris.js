const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('tris-status');
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "x";
let running = false;
let trisMode = 'pve'; // 'pve' or 'pvp'

// Global Init Function
function initTris(mode = 'pvp') {
    trisMode = mode;

    // Clear Board UI
    const board = document.getElementById('tris-board');
    board.innerHTML = '';
    // Generate cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('cellIndex', i);
        cell.addEventListener('click', cellClicked);
        board.appendChild(cell);
    }

    options.fill("");
    currentPlayer = "x";
    running = true;

    if (trisMode === 'pve') {
        statusText.textContent = "Tocca a te (X)";
        // If we want CPU to start we can add randomness, but standard: Player starts
    } else {
        const p1Name = playersConfig ? playersConfig.p1.name : "Player 1";
        const p1Color = playersConfig ? playersConfig.p1.color : "#3b82f6";
        statusText.textContent = `Tocca a: ${p1Name}`;
        statusText.style.color = p1Color;
    }
}

function cellClicked() {
    const cellIndex = this.getAttribute('cellIndex');

    if (options[cellIndex] != "" || !running) {
        return;
    }

    // Player Move
    updateCell(this, cellIndex);
    checkWinner();
}

function updateCell(cell, index) {
    options[index] = currentPlayer;
    cell.textContent = currentPlayer === 'x' ? '❌' : '⭕';
    cell.classList.add(currentPlayer);
}

function changePlayer() {
    currentPlayer = (currentPlayer == "x") ? "o" : "x";

    if (trisMode === 'pve') {
        if (currentPlayer === 'o' && running) {
            statusText.textContent = "La CPU sta pensando...";
            setTimeout(cpuMove, 500);
        } else {
            statusText.textContent = "Tocca a te (X)";
        }
    } else {
        const pKey = currentPlayer === 'x' ? 'p1' : 'p2';
        const pName = playersConfig[pKey].name;
        const pColor = playersConfig[pKey].color;
        statusText.textContent = `Tocca a: ${pName}`;
        statusText.style.color = pColor;
    }
}

function cpuMove() {
    if (!running) return;

    // Simple AI: Random empty spot
    let emptyIndices = [];
    options.forEach((val, idx) => {
        if (val === "") emptyIndices.push(idx);
    });

    if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        // Find cell element
        const cell = document.querySelector(`.cell[cellIndex='${randomIndex}']`);
        updateCell(cell, randomIndex);
        checkWinner();
    }
}

function checkWinner() {
    let roundWon = false;

    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = options[condition[0]];
        const cellB = options[condition[1]];
        const cellC = options[condition[2]];

        if (cellA == "" || cellB == "" || cellC == "") {
            continue;
        }
        if (cellA == cellB && cellB == cellC) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        if (trisMode === 'pve') {
            statusText.textContent = (currentPlayer === 'x') ? "Hai vinto! 🎉" : "La CPU ha vinto! 🤖";
        } else {
            const pKey = currentPlayer === 'x' ? 'p1' : 'p2';
            const pName = playersConfig[pKey].name;
            statusText.textContent = `${pName} ha vinto! 🎉`;
        }
        running = false;
    }
    else if (!options.includes("")) {
        statusText.textContent = `Pareggio! 😐`;
        running = false;
    }
    else {
        changePlayer();
    }
}

function resetTris() {
    initTris(trisMode);
}

window.initTris = initTris;
