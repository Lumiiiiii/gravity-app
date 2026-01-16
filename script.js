let currentGameMode = 'pve'; // 'pve' or 'pvp'
let playersConfig = {
    p1: { name: 'Player 1', color: '#ef4444' },
    p2: { name: 'Player 2', color: '#eab308' }
};

// TELEGRAM WEB APP INIT
const tg = window.Telegram.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

function openModeSelection(gameId, gameTitle) {
    selectedGameId = gameId;
    document.getElementById('mode-game-title').textContent = gameTitle;
    document.getElementById('mode-modal').classList.remove('hidden');
}

function closeModeModal() {
    document.getElementById('mode-modal').classList.add('hidden');
}

function closeSetupModal() {
    document.getElementById('player-setup-modal').classList.add('hidden');
    document.getElementById('mode-modal').classList.remove('hidden');
}

function startGameWithMode(mode) {
    currentGameMode = mode;
    closeModeModal();

    if (mode === 'pvp') {
        // Show Player Setup Modal
        document.getElementById('player-setup-modal').classList.remove('hidden');
    } else {
        // CPU Mode - Start immediately
        openGame(selectedGameId);
    }
}

function confirmPlayerSetup() {
    const p1Name = document.getElementById('p1-name').value || 'Player 1';
    const p1Color = document.getElementById('p1-color').value || '#ef4444';
    const p2Name = document.getElementById('p2-name').value || 'Player 2';
    const p2Color = document.getElementById('p2-color').value || '#eab308';

    playersConfig.p1 = { name: p1Name, color: p1Color };
    playersConfig.p2 = { name: p2Name, color: p2Color };

    document.getElementById('player-setup-modal').classList.add('hidden');
    openGame(selectedGameId);
}

function openGame(gameId) {
    // Hide Hub
    document.getElementById('game-hub').classList.remove('visible');
    document.getElementById('game-hub').classList.add('hidden');

    // Show Container
    const container = document.getElementById('game-container');
    container.classList.remove('hidden');
    container.classList.add('visible');

    // Hide all individual game views first
    document.querySelectorAll('.game-view').forEach(view => {
        view.classList.add('hidden');
    });

    // Show specific game
    document.getElementById(`game-${gameId}`).classList.remove('hidden');

    // Initialize specific game with mode
    if (gameId === 'memory') initMemory(currentGameMode);
    if (gameId === 'tris') initTris(currentGameMode);
    if (gameId === 'mole') startMoleSetup(currentGameMode); // Changed to Setup first for Mole
    if (gameId === 'connect4') initConnect4(currentGameMode);
    if (gameId === 'rps') initRPS(currentGameMode);
    if (gameId === 'clicker') initClicker();
}

function closeGame() {
    // Hide Container
    const container = document.getElementById('game-container');
    container.classList.remove('visible');
    container.classList.add('hidden');

    // Show Hub
    document.getElementById('game-hub').classList.remove('hidden');
    document.getElementById('game-hub').classList.add('visible');

    // Cleanup/Stopping logic if needed per game could go here
    if (typeof stopClicker === 'function') stopClicker();
}

/* VICTORY MODAL LOGIC */
let onRestartCallback = null;

function showVictory(title, message, onRestart) {
    document.getElementById('victory-title').textContent = title;
    document.getElementById('victory-message').innerHTML = message; // Allow HTML for line breaks

    const restartBtn = document.getElementById('victory-restart-btn');
    onRestartCallback = onRestart;

    restartBtn.onclick = () => {
        closeVictoryModal();
        if (onRestartCallback) onRestartCallback();
    };

    document.getElementById('victory-modal').classList.remove('hidden');

    // Simple confetti or sound could be triggered here
}

function closeVictoryModal() {
    document.getElementById('victory-modal').classList.add('hidden');
    // If user closes without restarting, we might want to return to hub or just stay viewing board?
    // "Chiudi" usually implies staying on board to see result.
    // "Torna alla Home" is already on main interface.
}

window.showVictory = showVictory;
window.closeVictoryModal = closeVictoryModal;
