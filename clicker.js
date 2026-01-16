let clickerCoins = 0;
let clickPower = 1;
let autoClickerCount = 0;
let autoClickerCost = 50;
let clickPowerCost = 20;
let clickerInterval = null;

const clickerAudio = new Audio(); // Placeholder for sound if needed

const clickableSkins = {
    'default': { color: '#fca5a5', shadow: 'rgba(252, 165, 165, 0.2)' },
    'neon-blue': { cost: 10000, color: '#0ea5e9', shadow: 'rgba(14, 165, 233, 0.2)' },
    'gold': { cost: 20000, color: '#eab308', shadow: 'rgba(234, 179, 8, 0.2)' },
    'matrix': { cost: 300000, color: '#22c55e', shadow: 'rgba(34, 197, 94, 0.2)' }
};

let ownedSkins = ['default'];
let currentSkin = 'default';

function initClicker() {
    // Reset or Load State
    clickerCoins = 0;
    clickPower = 1;
    autoClickerCount = 0;
    autoClickerCost = 50;
    clickPowerCost = 20;
    ownedSkins = ['default']; // Reset for now
    currentSkin = 'default';
    equipSkin('default');

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
    createFloatText(event);

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
    if (type === 'bg') return; // Future

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

function buySkin(skinId) {
    if (ownedSkins.includes(skinId)) {
        equipSkin(skinId);
        return;
    }

    if (clickableSkins[skinId]) {
        const cost = clickableSkins[skinId].cost;
        if (clickerCoins >= cost) {
            clickerCoins -= cost;
            ownedSkins.push(skinId);
            equipSkin(skinId);
            updateClickerUI();
        }
    }
}

function equipSkin(skinId) {
    if (!clickableSkins[skinId]) return;
    currentSkin = skinId;

    const data = clickableSkins[skinId];
    const btn = document.getElementById('click-target');

    // Apply styles
    btn.style.borderColor = data.color;
    btn.style.color = data.color;
    btn.style.backgroundColor = data.color + '22'; // 22 is roughly 13% alpha
    // We update the boxShadow in CSS usually, but here dynamic:
    // We can just rely on the color

    updateClickerUI();
}

function updateClickerUI() {
    document.getElementById('clicker-score').textContent = Math.floor(clickerCoins);
    document.getElementById('click-power-val').textContent = clickPower;
    document.getElementById('auto-click-val').textContent = autoClickerCount;

    document.getElementById('cost-power').textContent = clickPowerCost;
    document.getElementById('cost-auto').textContent = autoClickerCost;

    // Disable buttons if can't afford
    const btnPower = document.getElementById('btn-buy-power');
    const btnAuto = document.getElementById('btn-buy-auto');

    btnPower.disabled = clickerCoins < clickPowerCost;
    btnAuto.disabled = clickerCoins < autoClickerCost;

    // Toggle Glow Class
    if (clickerCoins >= clickPowerCost) btnPower.classList.add('can-buy');
    else btnPower.classList.remove('can-buy');

    if (clickerCoins >= autoClickerCost) btnAuto.classList.add('can-buy');
    else btnAuto.classList.remove('can-buy');

    // Update Skins UI
    const skinIds = ['neon-blue', 'gold', 'matrix'];
    skinIds.forEach(id => {
        const el = document.getElementById(`skin-${id}`);
        if (!el) return;

        // ownership
        if (ownedSkins.includes(id)) {
            el.classList.add('owned');
            el.querySelector('.cost').textContent = 'OWNED';
        } else {
            el.classList.remove('owned');
            // Optionally darken if not affordable?
            if (clickerCoins < clickableSkins[id].cost) el.style.opacity = '0.5';
            else el.style.opacity = '1';
        }

        // equipped
        if (currentSkin === id) el.classList.add('equipped');
        else el.classList.remove('equipped');
    });
}

function createFloatText(e) {
    const container = document.getElementById('clicker-area');
    const floatEl = document.createElement('div');
    floatEl.textContent = `+${clickPower}`;
    floatEl.className = 'float-text';

    // Dynamic color based on skin?
    if (clickableSkins[currentSkin]) {
        floatEl.style.color = clickableSkins[currentSkin].color;
    }

    container.appendChild(floatEl);

    setTimeout(() => {
        floatEl.remove();
    }, 800);
}

// Global exposure
window.initClicker = initClicker;
window.stopClicker = stopClicker;
window.clickTarget = clickTarget;
window.buyUpgrade = buyUpgrade;
window.buySkin = buySkin;
