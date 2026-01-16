const playerChoiceDisplay = document.getElementById('player-choice');
const cpuChoiceDisplay = document.getElementById('cpu-choice');
const resultDisplay = document.getElementById('rps-result');

const choices = [
    { id: 'sasso', emoji: '✊' },
    { id: 'carta', emoji: '✋' },
    { id: 'forbice', emoji: '✌️' }
];

let rpsMode = 'pve';
let p1Choice = null;

function initRPS(mode = 'pve') {
    rpsMode = mode;
    p1Choice = null;

    // Reset UI
    playerChoiceDisplay.textContent = '❔';
    cpuChoiceDisplay.textContent = '❔';
    resultDisplay.textContent = 'Fai la tua mossa!';
    resultDisplay.style.color = '';

    // Labels
    if (rpsMode === 'pvp') {
        document.querySelector('.player-side p').textContent = playersConfig.p1.name;
        document.querySelector('.cpu-side p').textContent = playersConfig.p2.name;
        document.querySelector('.player-side p').style.color = playersConfig.p1.color;
        document.querySelector('.cpu-side p').style.color = playersConfig.p2.color;
        document.querySelector('.rps-controls').classList.remove('hidden');
    } else {
        document.querySelector('.player-side p').textContent = 'Tu';
        document.querySelector('.cpu-side p').textContent = 'CPU';
        document.querySelector('.player-side p').style.color = '';
        document.querySelector('.cpu-side p').style.color = '';
        document.querySelector('.rps-controls').classList.remove('hidden');
    }
}

function playRPS(selection) {
    if (rpsMode === 'pve') {
        playPvE(selection);
    } else {
        playPvP(selection);
    }
}

function playPvE(playerSelection) {
    const playerObj = choices.find(c => c.id === playerSelection);
    playerChoiceDisplay.textContent = playerObj.emoji;

    const cpuIndex = Math.floor(Math.random() * 3);
    const cpuObj = choices[cpuIndex];
    cpuChoiceDisplay.textContent = cpuObj.emoji;

    determineWinner(playerSelection, cpuObj.id);
}

function playPvP(selection) {
    if (!p1Choice) {
        // P1 Turn
        p1Choice = selection;
        // Hide choice
        playerChoiceDisplay.textContent = '🔒';
        resultDisplay.textContent = `Scelta ${playersConfig.p1.name} salvata! Tocca a ${playersConfig.p2.name} (fai click su una mossa)`;
        // In a real app we'd hide buttons or show a "Ready P2" button, but simple:
        // P1 clicked. Now buttons are for P2.
        // We might want to clear P2 display if it had old data but init clears it.
    } else {
        // P2 Turn
        const p2Choice = selection;
        const p1Obj = choices.find(c => c.id === p1Choice);
        const p2Obj = choices.find(c => c.id === p2Choice);

        // Reveal
        playerChoiceDisplay.textContent = p1Obj.emoji;
        cpuChoiceDisplay.textContent = p2Obj.emoji;

        determineWinner(p1Choice, p2Choice);

        // Reset for next round
        p1Choice = null;
    }
}

function determineWinner(choice1, choice2) {
    let result = "";

    if (choice1 === choice2) {
        result = "Pareggio! 😐";
        resultDisplay.style.color = "#94a3b8";
    } else {
        if (
            (choice1 === 'sasso' && choice2 === 'forbice') ||
            (choice1 === 'carta' && choice2 === 'sasso') ||
            (choice1 === 'forbice' && choice2 === 'carta')
        ) {
            result = (rpsMode === 'pve' ? "Hai vinto! 🎉" : `${playersConfig.p1.name} Vince! 🎉`);
            resultDisplay.style.color = (rpsMode === 'pve' ? "#22c55e" : playersConfig.p1.color);
        } else {
            result = (rpsMode === 'pve' ? "Hai perso! 💀" : `${playersConfig.p2.name} Vince! 🎉`);
            resultDisplay.style.color = (rpsMode === 'pve' ? "#ef4444" : playersConfig.p2.color);
        }
    }

    resultDisplay.textContent = result;

    // Animations
    playerChoiceDisplay.classList.remove('shake');
    cpuChoiceDisplay.classList.remove('shake');
    void playerChoiceDisplay.offsetWidth;
    playerChoiceDisplay.classList.add('shake');
    cpuChoiceDisplay.classList.add('shake');
}

window.initRPS = initRPS;
window.playRPS = playRPS;
