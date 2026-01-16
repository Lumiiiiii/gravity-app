const squares = document.querySelectorAll('.hole');
const scoreDisplay = document.getElementById('mole-score');
const timeLeftDisplay = document.getElementById('mole-time');
const turnMsgDisplay = document.getElementById('mole-turn-msg');

let result = 0;
let hitPosition;
let currentTime = 30;
let timerId = null;
let countDownTimerId = null;
let moleMode = 'pve';
let moleTurn = 'p1'; // 'p1', 'p2'
let moleScores = { p1: 0, p2: 0 };
let moleRunning = false;

function startMoleSetup(mode = 'pve') {
    moleMode = mode;
    moleTurn = 'p1';
    moleScores = { p1: 0, p2: 0 };
    moleRunning = false;

    // Reset UI
    stopMoleGame();
    scoreDisplay.textContent = 0;
    timeLeftDisplay.textContent = 30;

    if (moleMode === 'pvp') {
        turnMsgDisplay.textContent = `Turno: ${playersConfig.p1.name} (Premi Start)`;
        turnMsgDisplay.style.color = playersConfig.p1.color;
    } else {
        turnMsgDisplay.textContent = "Modalità: Solo / CPU";
        turnMsgDisplay.style.color = '';
    }
}

function randomSquare() {
    squares.forEach(square => {
        square.innerHTML = '';
        square.classList.remove('active');
    });

    let randomSquare = squares[Math.floor(Math.random() * squares.length)];
    const mole = document.createElement('div');
    mole.classList.add('mole');
    randomSquare.appendChild(mole);
    setTimeout(() => mole.classList.add('up'), 10);

    hitPosition = randomSquare.id;

    mole.addEventListener('mousedown', () => {
        if (mole.classList.contains('whacked')) return;

        result++;
        scoreDisplay.textContent = result;
        hitPosition = null;
        mole.classList.add('whacked');
        mole.style.backgroundColor = "#ef4444";
        setTimeout(() => mole.remove(), 200);
    });
}

function moveMole() {
    timerId = setInterval(randomSquare, 800);
}

function stopMoleGame() {
    clearInterval(timerId);
    clearInterval(countDownTimerId);
    squares.forEach(square => square.innerHTML = '');
    moleRunning = false;
}

function countDown() {
    currentTime--;
    timeLeftDisplay.textContent = currentTime;

    if (currentTime == 0) {
        stopMoleGame();
        handleRoundEnd();
    }
}

function handleRoundEnd() {
    if (moleMode === 'pve') {
        showVictory("Game Over", `Punteggio finale: ${result}`, startMole);
    } else {
        // PvP Logic
        moleScores[moleTurn] = result;

        if (moleTurn === 'p1') {
            // Mid-turn notification. Using showVictory for consistency or a custom alert?
            // "Chiudi" in modal just hides it. So we rely on "Start" button in UI to continue.
            showVictory("Fine Turno",
                `Fine turno ${playersConfig.p1.name}!<br>Punteggio: <b>${result}</b><br>Tocca a ${playersConfig.p2.name}.`,
                () => {
                    // Callback on restart/close.
                    // We don't want to restart P1, we want to prep P2.
                    // The UI is already prepped by logic below.
                }
            );

            moleTurn = 'p2';
            // Reset for P2
            result = 0;
            currentTime = 30;
            scoreDisplay.textContent = 0;
            timeLeftDisplay.textContent = 30;
            turnMsgDisplay.textContent = `Turno: ${playersConfig.p2.name} (Premi Start)`;
            turnMsgDisplay.style.color = playersConfig.p2.color;
        } else {
            // End of P2
            let msg = `Fine partita!<br>
                       ${playersConfig.p1.name}: ${moleScores.p1}<br>
                       ${playersConfig.p2.name}: ${moleScores.p2}<br><br>`;

            let title = "Risultati";

            if (moleScores.p1 > moleScores.p2) msg += `<span style="color:${playersConfig.p1.color}">${playersConfig.p1.name} Vince! 🎉</span>`;
            else if (moleScores.p2 > moleScores.p1) msg += `<span style="color:${playersConfig.p2.color}">${playersConfig.p2.name} Vince! 🎉</span>`;
            else msg += "Pareggio! 😐";

            showVictory(title, msg, () => startMoleSetup('pvp'));
        }
    }
}

function startMole() {
    if (moleRunning) return; // Prevent double start

    // If PvP and stuck in end state, setup handles reset but button needs to trigger play

    stopMoleGame();
    // Keep result 0 if just starting round, but if mid-something? 
    // Logic: startMole is called by button.
    // If we just finished P1, we are ready for P2. result is 0 from handleRoundEnd logic.

    if (moleMode === 'pvp' && moleTurn === 'p2' && result !== 0) {
        // Safety reset if logic failed? No, handleRoundEnd sets result=0.
    }
    else if (!moleRunning) {
        // Standard Start or P1 Start
        result = 0;
        currentTime = 30;
        scoreDisplay.textContent = 0;
        timeLeftDisplay.textContent = 30;
    }

    moleRunning = true;
    moveMole();
    countDownTimerId = setInterval(countDown, 1000);

    if (moleMode === 'pvp') {
        const pName = moleTurn === 'p1' ? playersConfig.p1.name : playersConfig.p2.name;
        turnMsgDisplay.textContent = `Partita in corso: ${pName}`;
    }
}

window.startMole = startMole;
window.startMoleSetup = startMoleSetup;
