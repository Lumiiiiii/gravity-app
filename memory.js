const memoryGrid = document.getElementById('memory-grid');
const movesDisplay = document.getElementById('memory-moves');
// We will repurpose the game-info area dynamically for PvP/PvE scores

const cardsArray = [
    { name: 'alien', icon: '👽' },
    { name: 'ghost', icon: '👻' },
    { name: 'robot', icon: '🤖' },
    { name: 'unicorn', icon: '🦄' },
    { name: 'pumpkin', icon: '🎃' },
    { name: 'fire', icon: '🔥' },
    { name: 'star', icon: '⭐' },
    { name: 'zap', icon: '⚡' }
];

let memoryCards = [];
let cardsChosen = [];
let cardsChosenId = [];
let cardsWon = [];
let moves = 0; // Only for Solo
let memoryMode = 'pve';
let memoryTurn = 'p1'; // 'p1', 'p2' (or 'cpu')
let scores = { p1: 0, p2: 0 };
let memoryRunning = false;

function initMemory(mode = 'pve') {
    memoryMode = mode;
    memoryTurn = 'p1';
    scores = { p1: 0, p2: 0 };
    memoryRunning = true;

    // UI Setup
    const infoContainer = document.querySelector('#game-memory .game-info span');
    if (mode === 'solo') { // Legacy or if we added a solo mode loop? Assume PVE is vs CPU, 'solo' is original? 
        // Request said: "giocare in due ... o contro la CPU". Original was solo.
        // Let's assume PVE = CPU, PVP = 2 Players.
        // If user wants just solo? The prompt implies 2 modes. 
        // I'll stick to PVE (vs CPU) and PVP. 
        // Wait, original was just solo.
        // Let's handle "pve" as CPU and "pvp" as 2P.
    }

    updateMemoryUI();

    // Reset state
    memoryCards = [...cardsArray, ...cardsArray];
    memoryCards.sort(() => 0.5 - Math.random());
    cardsChosen = [];
    cardsChosenId = [];
    cardsWon = [];

    memoryGrid.innerHTML = '';

    for (let i = 0; i < memoryCards.length; i++) {
        const card = document.createElement('div');
        card.setAttribute('class', 'memory-card');
        card.setAttribute('data-id', i);
        card.addEventListener('click', flipCard);
        memoryGrid.appendChild(card);
    }
}

function updateMemoryUI() {
    const infoContainer = document.querySelector('#game-memory .game-info');
    // We need to preserve the button
    const btn = infoContainer.querySelector('.restart-btn');

    let html = '';
    if (memoryMode === 'pvp') {
        const p1N = playersConfig.p1.name;
        const p2N = playersConfig.p2.name;
        const currentN = memoryTurn === 'p1' ? p1N : p2N;
        const currentColor = memoryTurn === 'p1' ? playersConfig.p1.color : playersConfig.p2.color;

        html = `<span>${p1N}: ${scores.p1} | ${p2N}: ${scores.p2} <br> Tocca a: <span style="color:${currentColor}">${currentN}</span></span>`;
    } else if (memoryMode === 'pve') {
        html = `<span>Tu: ${scores.p1} | CPU: ${scores.p2} <br> Tocca a: ${memoryTurn === 'p1' ? 'Tu' : 'CPU'}</span>`;
    } else {
        // Default cleanup if needed
        html = `<span>Mosse: 0</span>`;
    }

    // Replace text span but keep button
    // Actually easier to just rebuild content
    infoContainer.innerHTML = html;
    infoContainer.appendChild(btn);
}

function flipCard() {
    if (!memoryRunning) return;
    if (memoryMode === 'pve' && memoryTurn === 'p2') return; // CPU turn

    let cardId = this.getAttribute('data-id');

    if (cardsChosenId.includes(cardId) || this.classList.contains('flipped') || this.classList.contains('matched')) {
        return;
    }

    processFlip(this, cardId);
}

function processFlip(card, cardId) {
    card.classList.add('flipped');
    card.textContent = memoryCards[cardId].icon;

    cardsChosen.push(memoryCards[cardId].name);
    cardsChosenId.push(cardId);

    if (cardsChosen.length === 2) {
        setTimeout(checkForMatch, 500);
    }
}

function checkForMatch() {
    const cards = document.querySelectorAll('.memory-card');
    const optionOneId = cardsChosenId[0];
    const optionTwoId = cardsChosenId[1];

    let matchFound = false;

    if (cardsChosen[0] === cardsChosen[1]) {
        matchFound = true;
        cards[optionOneId].classList.add('matched');
        cards[optionTwoId].classList.add('matched');

        // Update Score
        scores[memoryTurn]++;

        cardsWon.push(cardsChosen);
    } else {
        cards[optionOneId].classList.remove('flipped');
        cards[optionOneId].textContent = '';
        cards[optionTwoId].classList.remove('flipped');
        cards[optionTwoId].textContent = '';

        // Switch Turn if no match
        memoryTurn = memoryTurn === 'p1' ? 'p2' : 'p1';
    }

    cardsChosen = [];
    cardsChosenId = [];

    updateMemoryUI();

    if (cardsWon.length === memoryCards.length / 2) {
        endMemoryGame();
    } else {
        if (memoryMode === 'pve' && memoryTurn === 'p2') {
            setTimeout(cpuMemoryMove, 1000);
        }
    }
}

function cpuMemoryMove() {
    if (!memoryRunning || memoryTurn !== 'p2') return;

    // Simple AI: Pick 2 random unrevealed cards
    // 1. Find unrevealed
    const cards = document.querySelectorAll('.memory-card');
    let availableIndices = [];
    cards.forEach((card, index) => {
        if (!card.classList.contains('flipped') && !card.classList.contains('matched')) {
            availableIndices.push(index);
        }
    });

    if (availableIndices.length < 2) return;

    // Pick 1
    const idx1 = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    // Pick 2 (different)
    let idx2 = idx1;
    while (idx2 === idx1) {
        idx2 = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    const card1 = cards[idx1];
    const card2 = cards[idx2]; // Wait, logic flow: flip 1, wait, flip 2.

    // Visual flow
    processFlip(card1, idx1);

    setTimeout(() => {
        processFlip(card2, idx2);
    }, 600);
}

function endMemoryGame() {
    memoryRunning = false;
    let msg = '';
    let title = 'Fine Partita';

    if (scores.p1 > scores.p2) {
        msg = (memoryMode === 'pve' ? 'Hai vinto! 🎉' : `${playersConfig.p1.name} Vince! 🎉`);
        title = (memoryMode === 'pve' ? 'Vittoria!' : 'Vincitore!');
    }
    else if (scores.p2 > scores.p1) {
        msg = (memoryMode === 'pve' ? 'CPU Vince! 🤖' : `${playersConfig.p2.name} Vince! 🎉`);
        title = (memoryMode === 'pve' ? 'Sconfitta!' : 'Vincitore!');
    }
    else {
        msg = 'Pareggio!';
        title = 'Pareggio';
    }

    showVictory(title, msg, () => initMemory(memoryMode));
}

window.initMemory = initMemory;
