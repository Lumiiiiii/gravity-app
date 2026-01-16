const c4Board = document.getElementById('c4-board');
const c4Status = document.getElementById('c4-status');
const rows = 6;
const cols = 7;
let c4Grid = []; // Array of arrays [row][col]
let c4Player = 'red'; // 'red' or 'yellow'
let c4Running = false;
let c4Mode = 'pve';


function initConnect4(mode = 'pvp') {
    c4Mode = mode;
    c4Player = 'p1'; // Start with Player 1
    c4Running = true;

    // Update config if in PvP (handled globally now via playersConfig)
    updateStatus();

    createBoard();
}

function updateStatus() {
    if (c4Mode === 'pve') {
        c4Status.textContent = `Tocca a: ROSSO (Tu)`;
    } else {
        const playerName = playersConfig[c4Player].name;
        c4Status.textContent = `Tocca a: ${playerName}`;
        c4Status.style.color = playersConfig[c4Player].color;
    }
}

function createBoard() {
    c4Board.innerHTML = '';
    c4Grid = [];

    // Initialize empty grid logic
    for (let r = 0; r < rows; r++) {
        let rowArr = [];
        for (let c = 0; c < cols; c++) {
            rowArr.push(null);
        }
        c4Grid.push(rowArr);
    }

    // Create DOM elements (Cells)
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('c4-cell');
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => dropPiece(c));
            c4Board.appendChild(cell);
        }
    }
}

function dropPiece(colIndex) {
    if (!c4Running) return;
    if (c4Mode === 'pve' && c4Player === 'p2') return; // CPU turn (p2 is cpu in pve logic usually, but let's keep 'p2'/'yellow' mapping for PvE simplicity or update logic)

    // PvE Legacy compatibility: 'red'/'yellow' vs 'p1'/'p2'
    // Let's standarize: p1 = red/custom1, p2 = yellow/custom2
    // If PvE, we use standard names/colors or just map p1->red p2->yellow internally if simplicity needed.
    // For now, let's assume pve still uses 'red'/'yellow' strings or we switch to 'p1'/'p2'.
    // To minimize breakage, let's stick to 'p1' and 'p2' for logic, and resolve color for display.

    // Find lowest empty row in this col
    let r = rows - 1;
    while (r >= 0) {
        if (!c4Grid[r][colIndex]) {
            break;
        }
        r--;
    }

    if (r < 0) return; // Column full

    const color = (c4Mode === 'pve') ? (c4Player === 'p1' ? 'red' : 'yellow') : playersConfig[c4Player].color;
    const playerKey = c4Player; // 'p1' or 'p2'

    animateDrop(r, colIndex, playerKey, color);
}

function animateDrop(r, c, playerKey, colorVal) {
    c4Grid[r][c] = playerKey; // Store player key
    const cell = document.querySelector(`.c4-cell[data-r='${r}'][data-c='${c}']`);

    // Apply color style directly for custom colors
    cell.style.backgroundColor = colorVal;
    cell.style.boxShadow = `0 0 10px ${colorVal}`;

    if (checkWin(r, c, playerKey)) {
        let winName;
        let title = "Vittoria!";
        let msg = "";

        if (c4Mode === 'pve') {
            winName = (playerKey === 'p1') ? "ROSSO" : "GIALLO";
            title = (playerKey === 'p1') ? "Vittoria!" : "Sconfitta!";
            msg = (playerKey === 'p1') ? "Hai vinto! 🎉" : "La CPU ha vinto! 🤖";
        } else {
            winName = playersConfig[playerKey].name;
            msg = `${winName} VINCE! 🎉`;
        }

        c4Status.textContent = `${winName} VINCE! 🎉`; // Keep text update for background
        c4Running = false;
        showVictory(title, msg, initConnect4); // initConnect4 is restart
        return;
    }

    // Check Draw
    if (c4Grid.flat().every(val => val !== null)) {
        c4Status.textContent = "PAREGGIO!";
        c4Running = false;
        showVictory("Pareggio!", "Nessuna mossa rimasta.", initConnect4);
        return;
    }

    // Switch Turn
    c4Player = c4Player === 'p1' ? 'p2' : 'p1';

    if (c4Mode === 'pve') {
        const pName = c4Player === 'p1' ? 'ROSSO' : 'GIALLO';
        c4Status.textContent = `Tocca a: ${pName}`;
        c4Status.style.color = c4Player === 'p1' ? '#ef4444' : '#eab308';

        if (c4Player === 'p2' && c4Running) {
            setTimeout(cpuMove, 600);
        }
    } else {
        updateStatus();
    }
}

function cpuMove() {
    // Simple AI: Pick random valid column
    let validCols = [];
    for (let c = 0; c < cols; c++) {
        if (!c4Grid[0][c]) validCols.push(c);
    }

    if (validCols.length > 0) {
        const randomCol = validCols[Math.floor(Math.random() * validCols.length)];

        // Emulate drop logic
        let r = rows - 1;
        while (r >= 0) {
            if (!c4Grid[r][randomCol]) break;
            r--;
        }
        // CPU is 'p2' (yellow)
        animateDrop(r, randomCol, 'p2', '#eab308');
    }
}

function checkWin(r, c, color) {
    // Check Horizontal, Vertical, Diagonal
    return checkDirection(r, c, 0, 1, color) || // Horizontal
        checkDirection(r, c, 1, 0, color) || // Vertical
        checkDirection(r, c, 1, 1, color) || // Diagonal \
        checkDirection(r, c, 1, -1, color);  // Diagonal /
}

function checkDirection(r, c, dr, dc, color) {
    let count = 0;

    // Check forwards and backwards 3 spots
    // Better: iterate from -3 to +3
    // But we need 4 connected.

    // Simple verification: centered at new piece
    // Check 3 in one direction + current + 3 in other
    // For specific (r,c), check line defined by dr,dc

    // Optimization: Just count consecutive in that line passing through r,c
    let consecutive = 0;

    // From -3 to 3
    for (let i = -3; i <= 3; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && c4Grid[nr][nc] === color) {
            consecutive++;
            if (consecutive >= 4) return true;
        } else {
            consecutive = 0;
        }
    }
    return false;
}

window.initConnect4 = initConnect4;
