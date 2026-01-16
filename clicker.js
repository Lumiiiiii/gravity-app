let clickerCoins = 0;
let clickPower = 1;
let autoClickerCount = 0;
let autoClickerCost = 50;
let clickPowerCost = 20;
let clickerInterval = null;

const clickerAudio = new Audio(); // Placeholder for sound if needed

function initClicker() {
    // Reset or Load State
    // For simplicity, reset on open or we could persist. Let's reset for now to match other games.
    clickerCoins = 0;
    clickPower = 1;
    autoClickerCount = 0;
    autoClickerCost = 50;
    clickPowerCost = 20;

    updateClickerUI();

    // Start Auto Loop
    if (clickerInterval) clearInterval(clickerInterval);
    clickerInterval = setInterval(autoClickLoop, 1000);
}

function stopClicker() {
    if (clickerInterval) clearInterval(clickerInterval);
}

function clickTarget(event) {
    clickerCoins += clickPower;

    // Visual Float Text
    createFloatText(event); // We will implement this helper or just animate the button

    // Animate Button
    const btn = document.getElementById('click-target');
    btn.classList.remove('pulse');
    void btn.offsetWidth; // trigger reflow
    btn.classList.add('pulse');

    updateClickerUI();
}

function autoClickLoop() {
    if (autoClickerCount > 0) {
        clickerCoins += autoClickerCount;
        updateClickerUI();
    }
}

function buyUpgrade(type) {
    if (type === 'bg') return; // Future skin upgrade?

    if (type === 'power') {
        if (clickerCoins >= clickPowerCost) {
            clickerCoins -= clickPowerCost;
            clickPower++;
            clickPowerCost = Math.floor(clickPowerCost * 1.5);
            updateClickerUI();
        }
    } else if (type === 'auto') {
        if (clickerCoins >= autoClickerCost) {
            clickerCoins -= autoClickerCost;
            autoClickerCount++;
            autoClickerCost = Math.floor(autoClickerCost * 1.5);
            updateClickerUI();
        }
    }
}

function updateClickerUI() {
    document.getElementById('clicker-score').textContent = clickerCoins;
    document.getElementById('click-power-val').textContent = clickPower;
    document.getElementById('auto-click-val').textContent = autoClickerCount;

    document.getElementById('cost-power').textContent = clickPowerCost;
    document.getElementById('cost-auto').textContent = autoClickerCost;

    // Disable buttons if can't afford
    document.getElementById('btn-buy-power').disabled = clickerCoins < clickPowerCost;
    document.getElementById('btn-buy-auto').disabled = clickerCoins < autoClickerCost;
}

function createFloatText(e) {
    // Simple visual effect
    const container = document.getElementById('clicker-area');
    const floatEl = document.createElement('div');
    floatEl.textContent = `+${clickPower}`;
    floatEl.className = 'float-text';

    // Randomize position slightly around center if e is null (auto) or specific if click
    // For simplicity, center of target

    container.appendChild(floatEl);

    setTimeout(() => {
        floatEl.remove();
    }, 800);
}

// Global exposure
window.initClicker = initClicker;
window.stopClicker = stopClicker; // To call when closing
window.clickTarget = clickTarget;
window.buyUpgrade = buyUpgrade;
