// ========================================
// NEON CLICKER - Premium Idle Game
// ========================================

// === GAME STATE ===
let gameState = {
    coins: 0,
    totalCoinsEarned: 0,
    totalClicks: 0,
    prestigeLevel: 0,
    prestigePoints: 0,

    // Upgrades
    upgrades: {
        clickPower: { level: 1, baseCost: 20, costMultiplier: 1.5 },
        autoClicker: { level: 0, baseCost: 50, costMultiplier: 1.5 },
        critChance: { level: 0, baseCost: 100, costMultiplier: 1.8 },
        multiplier: { level: 0, baseCost: 500, costMultiplier: 2.0 },
        comboBonus: { level: 0, baseCost: 1000, costMultiplier: 1.7 }
    },

    // Skins
    ownedSkins: ['default'],
    equippedSkin: 'default',

    // Stats
    highestCombo: 1,
    startTime: Date.now(),

    // Combo System
    combo: 1,
    lastClickTime: 0,
    comboTimeout: null,

    // Premium
    premiumBoosts: {
        multiplier24h: false,
        multiplier24hExpiry: 0
    }
};

// === SKIN DEFINITIONS ===
const SKINS = {
    // COMMON (10k - 50k)
    'default': {
        name: 'Default',
        rarity: 'common',
        cost: 0,
        color: '#fca5a5',
        shadow: 'rgba(252, 165, 165, 0.5)',
        emoji: '⚡',
        particles: false
    },
    'neon-blue': {
        name: 'Neon Blue',
        rarity: 'common',
        cost: 10000,
        color: '#0ea5e9',
        shadow: 'rgba(14, 165, 233, 0.6)',
        emoji: '💎',
        particles: false
    },
    'toxic-green': {
        name: 'Toxic Green',
        rarity: 'common',
        cost: 25000,
        color: '#84cc16',
        shadow: 'rgba(132, 204, 22, 0.6)',
        emoji: '☢️',
        particles: false
    },
    'hot-pink': {
        name: 'Hot Pink',
        rarity: 'common',
        cost: 50000,
        color: '#ec4899',
        shadow: 'rgba(236, 72, 153, 0.6)',
        emoji: '💖',
        particles: false
    },

    // RARE (100k - 500k)
    'gold-rush': {
        name: 'Gold Rush',
        rarity: 'rare',
        cost: 100000,
        color: '#eab308',
        shadow: 'rgba(234, 179, 8, 0.7)',
        emoji: '👑',
        particles: true,
        particleColor: '#fbbf24'
    },
    'purple-haze': {
        name: 'Purple Haze',
        rarity: 'rare',
        cost: 200000,
        color: '#a855f7',
        shadow: 'rgba(168, 85, 247, 0.7)',
        emoji: '🔮',
        particles: true,
        particleColor: '#c084fc'
    },
    'cyber-cyan': {
        name: 'Cyber Cyan',
        rarity: 'rare',
        cost: 350000,
        color: '#06b6d4',
        shadow: 'rgba(6, 182, 212, 0.7)',
        emoji: '🌊',
        particles: true,
        particleColor: '#22d3ee'
    },
    'crimson-fury': {
        name: 'Crimson Fury',
        rarity: 'rare',
        cost: 500000,
        color: '#dc2626',
        shadow: 'rgba(220, 38, 38, 0.7)',
        emoji: '🔥',
        particles: true,
        particleColor: '#ef4444'
    },

    // EPIC (1M - 5M)
    'aurora': {
        name: 'Aurora Borealis',
        rarity: 'epic',
        cost: 1000000,
        color: '#10b981',
        shadow: 'rgba(16, 185, 129, 0.8)',
        gradient: 'linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6)',
        emoji: '🌌',
        particles: true,
        particleColor: '#10b981'
    },
    'phoenix': {
        name: 'Phoenix Fire',
        rarity: 'epic',
        cost: 2500000,
        color: '#f97316',
        shadow: 'rgba(249, 115, 22, 0.9)',
        gradient: 'linear-gradient(45deg, #f97316, #ef4444, #dc2626)',
        emoji: '🔥',
        particles: true,
        particleColor: '#fb923c'
    },
    'galaxy': {
        name: 'Galaxy Burst',
        rarity: 'epic',
        cost: 5000000,
        color: '#667eea',
        shadow: 'rgba(102, 126, 234, 1)',
        gradient: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb)',
        emoji: '🌠',
        particles: true,
        particleColor: '#a78bfa'
    },

    // LEGENDARY (10M+ or Premium)
    'matrix': {
        name: 'The Matrix',
        rarity: 'legendary',
        cost: 10000000,
        color: '#22c55e',
        shadow: 'rgba(34, 197, 94, 1.2)',
        gradient: 'linear-gradient(135deg, #000000, #22c55e)',
        emoji: '🖥️',
        particles: true,
        particleColor: '#4ade80',
        special: 'rain'
    },
    'rainbow': {
        name: 'Rainbow Dream',
        rarity: 'legendary',
        cost: { type: 'premium', item: 'legendary' },
        color: '#ff0080',
        shadow: 'rgba(255, 0, 128, 1.2)',
        gradient: 'linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #ff0080)',
        emoji: '🌈',
        particles: true,
        particleColor: '#ff0080',
        special: 'rainbow'
    },
    'cosmic': {
        name: 'Cosmic Energy',
        rarity: 'legendary',
        cost: { type: 'premium', item: 'legendary' },
        color: '#ffffff',
        shadow: 'rgba(255, 255, 255, 1.5)',
        gradient: 'radial-gradient(circle, #ffffff, #667eea, #000000)',
        emoji: '✨',
        particles: true,
        particleColor: '#ffffff',
        special: 'stars'
    }
};

// === INITIALIZATION ===
function initGame() {
    loadGameState();
    renderAllSkins();
    updateAllUI();
    startAutoClicker();
    startTimeTracking();
    equipSkin(gameState.equippedSkin);

    // Auto-save every 5 seconds
    setInterval(saveGameState, 5000);
}

// === SAVE/LOAD SYSTEM ===
function saveGameState() {
    localStorage.setItem('neonClickerSave', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('neonClickerSave');
    if (saved) {
        const loaded = JSON.parse(saved);
        gameState = { ...gameState, ...loaded };

        // Recalculate time-based things
        if (gameState.premiumBoosts.multiplier24hExpiry < Date.now()) {
            gameState.premiumBoosts.multiplier24h = false;
        }
    }
}

function resetGame() {
    if (confirm('⚠️ Are you sure? This will delete ALL progress!')) {
        localStorage.removeItem('neonClickerSave');
        location.reload();
    }
}

// === CLICK MECHANICS ===
function performClick(event) {
    const clickPower = getClickPower();
    const isCrit = Math.random() < getCritChance();
    const comboMulti = getComboMultiplier();

    let earnedCoins = clickPower * comboMulti;
    if (isCrit) earnedCoins *= 2;

    gameState.coins += earnedCoins;
    gameState.totalCoinsEarned += earnedCoins;
    gameState.totalClicks++;

    // Combo System
    updateCombo();

    // Visual feedback
    createFloatingText(event, earnedCoins, isCrit);
    animateClickButton();

    updateAllUI();
}

function updateCombo() {
    const now = Date.now();
    const timeSinceLastClick = now - gameState.lastClickTime;

    if (timeSinceLastClick < 800) { // 0.8s window
        gameState.combo++;
        if (gameState.combo > gameState.highestCombo) {
            gameState.highestCombo = gameState.combo;
        }
    } else {
        gameState.combo = 1;
    }

    gameState.lastClickTime = now;

    // Reset combo after inactivity
    clearTimeout(gameState.comboTimeout);
    gameState.comboTimeout = setTimeout(() => {
        gameState.combo = 1;
        updateComboUI();
    }, 800);

    updateComboUI();
}

function updateComboUI() {
    const comboIndicator = document.getElementById('combo-indicator');
    const comboValue = document.getElementById('combo-value');

    comboValue.textContent = gameState.combo;

    if (gameState.combo > 1) {
        comboIndicator.classList.add('active');
        if (gameState.combo >= 10) comboIndicator.classList.add('mega');
        else comboIndicator.classList.remove('mega');
    } else {
        comboIndicator.classList.remove('active');
        comboIndicator.classList.remove('mega');
    }
}

// === UPGRADE SYSTEM ===
function buyUpgrade(upgradeType) {
    const upgrade = gameState.upgrades[upgradeType];
    if (!upgrade) return;

    const cost = getUpgradeCost(upgradeType);

    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        upgrade.level++;

        showNotification(`✅ ${upgradeType} upgraded to level ${upgrade.level}!`);
        updateAllUI();
    } else {
        showNotification('❌ Not enough coins!');
    }
}

function getUpgradeCost(upgradeType) {
    const upgrade = gameState.upgrades[upgradeType];
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level - 1));
}

// === CALCULATIONS ===
function getClickPower() {
    return gameState.upgrades.clickPower.level * getGlobalMultiplier();
}

function getAutoClickerPower() {
    return gameState.upgrades.autoClicker.level * getGlobalMultiplier();
}

function getCritChance() {
    return Math.min(0.5, gameState.upgrades.critChance.level * 0.02); // Max 50%
}

function getGlobalMultiplier() {
    let multi = 1;
    multi += gameState.upgrades.multiplier.level * 0.1;
    multi += gameState.prestigePoints * 0.1; // 10% per prestige point
    if (gameState.premiumBoosts.multiplier24h) multi *= 2;
    return multi;
}

function getComboMultiplier() {
    const baseBonus = 1 + (gameState.upgrades.comboBonus.level * 0.05);
    return 1 + ((gameState.combo - 1) * 0.1 * baseBonus);
}

// === AUTO CLICKER ===
let autoClickerInterval = null;

function startAutoClicker() {
    if (autoClickerInterval) clearInterval(autoClickerInterval);

    autoClickerInterval = setInterval(() => {
        if (gameState.upgrades.autoClicker.level > 0) {
            const autoEarned = getAutoClickerPower();
            gameState.coins += autoEarned;
            gameState.totalCoinsEarned += autoEarned;
            updateAllUI();
        }
    }, 1000);
}

// === PRESTIGE SYSTEM ===
function attemptPrestige() {
    const requiredCoins = 100000000; // 100M

    if (gameState.coins >= requiredCoins) {
        document.getElementById('prestige-modal').classList.remove('hidden');

        const pointsGain = Math.floor(1 + gameState.coins / requiredCoins);
        document.getElementById('prestige-points-gain').textContent = `+${pointsGain}`;
    } else {
        showNotification(`❌ Need ${formatNumber(requiredCoins)} coins to prestige!`);
    }
}

function confirmPrestige() {
    const pointsGain = Math.floor(1 + gameState.coins / 100000000);

    // Reset
    gameState.coins = 0;
    gameState.totalClicks = 0;
    gameState.combo = 1;
    gameState.upgrades = {
        clickPower: { level: 1, baseCost: 20, costMultiplier: 1.5 },
        autoClicker: { level: 0, baseCost: 50, costMultiplier: 1.5 },
        critChance: { level: 0, baseCost: 100, costMultiplier: 1.8 },
        multiplier: { level: 0, baseCost: 500, costMultiplier: 2.0 },
        comboBonus: { level: 0, baseCost: 1000, costMultiplier: 1.7 }
    };

    // Keep skins, premium status
    // Gain prestige
    gameState.prestigeLevel++;
    gameState.prestigePoints += pointsGain;

    closePrestigeModal();
    showNotification(`⭐ PRESTIGED! +${pointsGain} Prestige Points!`);
    updateAllUI();
}

function closePrestigeModal() {
    document.getElementById('prestige-modal').classList.add('hidden');
}

// === SKIN SYSTEM ===
function renderAllSkins() {
    const categories = { common: [], rare: [], epic: [], legendary: [] };

    for (const [id, skin] of Object.entries(SKINS)) {
        if (id === 'default') continue;
        categories[skin.rarity].push({ id, ...skin });
    }

    for (const [rarity, skins] of Object.entries(categories)) {
        const container = document.getElementById(`skins-${rarity}`);
        container.innerHTML = '';

        skins.forEach(skin => {
            const skinEl = createSkinElement(skin.id, skin);
            container.appendChild(skinEl);
        });
    }
}

function createSkinElement(skinId, skin) {
    const div = document.createElement('div');
    div.className = 'skin-item';
    div.onclick = () => buySkin(skinId);

    const isOwned = gameState.ownedSkins.includes(skinId);
    const isEquipped = gameState.equippedSkin === skinId;

    if (isOwned) div.classList.add('owned');
    if (isEquipped) div.classList.add('equipped');

    const previewStyle = skin.gradient
        ? `background: ${skin.gradient};`
        : `background: ${skin.color}; box-shadow: 0 0 15px ${skin.shadow};`;

    const costText = typeof skin.cost === 'number'
        ? formatNumber(skin.cost)
        : '💎 Premium';

    div.innerHTML = `
        <div class="skin-preview" style="${previewStyle}">${skin.emoji}</div>
        <p class="skin-name">${skin.name}</p>
        <span class="skin-cost">${isOwned ? (isEquipped ? 'EQUIPPED' : 'OWNED') : costText}</span>
    `;

    return div;
}

function buySkin(skinId) {
    const skin = SKINS[skinId];
    if (!skin) return;

    if (gameState.ownedSkins.includes(skinId)) {
        equipSkin(skinId);
        return;
    }

    // Check if premium skin
    if (typeof skin.cost === 'object') {
        showNotification('💎 This is a premium skin! Check Premium tab.');
        return;
    }

    if (gameState.coins >= skin.cost) {
        gameState.coins -= skin.cost;
        gameState.ownedSkins.push(skinId);
        equipSkin(skinId);
        showNotification(`✅ Unlocked: ${skin.name}!`);
        renderAllSkins();
        updateAllUI();
    } else {
        showNotification('❌ Not enough coins!');
    }
}

function equipSkin(skinId) {
    const skin = SKINS[skinId];
    if (!skin) return;

    gameState.equippedSkin = skinId;

    const btn = document.getElementById('click-target');
    btn.textContent = skin.emoji;

    if (skin.gradient) {
        btn.style.background = skin.gradient;
        btn.style.borderColor = skin.color;
    } else {
        btn.style.background = `${skin.color}22`;
        btn.style.borderColor = skin.color;
        btn.style.color = skin.color;
    }

    btn.style.boxShadow = `0 0 40px ${skin.shadow}`;

    // Update particles if needed
    if (skin.particles) {
        btn.classList.add('has-particles');
    } else {
        btn.classList.remove('has-particles');
    }

    renderAllSkins();
}

// === PREMIUM SYSTEM (Simulated) ===
let currentPremiumItem = null;

function buyPremiumItem(itemId) {
    currentPremiumItem = itemId;
    const modal = document.getElementById('premium-modal');
    const title = document.getElementById('premium-modal-title');
    const desc = document.getElementById('premium-modal-desc');
    const confirmBtn = document.getElementById('premium-confirm-btn');

    const items = {
        'starter': { name: 'Starter Pack', stars: 50, coins: 1000000, skin: 'random-common' },
        'megaboost': { name: 'Mega Boost', stars: 100, effect: '24h-2x' },
        'legendary': { name: 'Legendary Pack', stars: 200, skins: ['rainbow', 'cosmic'] },
        'prestige': { name: 'Prestige Booster', stars: 150, prestigePoints: 5 },
        'ultimate': { name: 'Ultimate Bundle', stars: 500, all: true }
    };

    const item = items[itemId];
    title.textContent = `${item.name}`;
    desc.textContent = `Cost: ${item.stars} Telegram Stars ⭐\n\n(Testing mode - click to simulate purchase)`;

    confirmBtn.onclick = () => processPremiumPurchase(itemId, item);

    modal.classList.remove('hidden');
}

function processPremiumPurchase(itemId, item) {
    // Simulate Telegram Stars purchase
    showNotification(`✨ Premium purchase simulated: ${item.name}`);

    if (item.coins) {
        gameState.coins += item.coins;
    }

    if (item.skin === 'random-common') {
        const commonSkins = Object.entries(SKINS)
            .filter(([id, s]) => s.rarity === 'common' && !gameState.ownedSkins.includes(id))
            .map(([id]) => id);
        if (commonSkins.length > 0) {
            const randomSkin = commonSkins[Math.floor(Math.random() * commonSkins.length)];
            gameState.ownedSkins.push(randomSkin);
            showNotification(`🎁 Unlocked: ${SKINS[randomSkin].name}!`);
        }
    }

    if (item.skins) {
        item.skins.forEach(skinId => {
            if (!gameState.ownedSkins.includes(skinId)) {
                gameState.ownedSkins.push(skinId);
                showNotification(`💫 Unlocked: ${SKINS[skinId].name}!`);
            }
        });
    }

    if (item.prestigePoints) {
        gameState.prestigePoints += item.prestigePoints;
    }

    if (item.effect === '24h-2x') {
        gameState.premiumBoosts.multiplier24h = true;
        gameState.premiumBoosts.multiplier24hExpiry = Date.now() + (24 * 60 * 60 * 1000);
        showNotification('⚡ 2x Multiplier active for 24 hours!');
    }

    if (item.all) {
        gameState.coins += 10000000;
        gameState.prestigePoints += 5;
        gameState.premiumBoosts.multiplier24h = true;
        gameState.premiumBoosts.multiplier24hExpiry = Date.now() + (24 * 60 * 60 * 1000);
        ['rainbow', 'cosmic'].forEach(skinId => {
            if (!gameState.ownedSkins.includes(skinId)) {
                gameState.ownedSkins.push(skinId);
            }
        });
        showNotification('🔥 ULTIMATE BUNDLE ACTIVATED!');
    }

    closePremiumModal();
    updateAllUI();
    renderAllSkins();
}

function closePremiumModal() {
    document.getElementById('premium-modal').classList.add('hidden');
}

// === UI UPDATES ===
function updateAllUI() {
    // Header
    document.getElementById('header-coins').textContent = formatNumber(gameState.coins);
    document.getElementById('header-prestige').textContent = gameState.prestigeLevel;

    // Main score
    document.getElementById('main-score').textContent = formatNumber(gameState.coins);
    document.getElementById('cps-display').textContent = formatNumber(getAutoClickerPower());

    // Stats mini
    document.getElementById('stat-power').textContent = Math.floor(getClickPower());
    document.getElementById('stat-crit').textContent = `${Math.floor(getCritChance() * 100)}%`;
    document.getElementById('stat-multi').textContent = getGlobalMultiplier().toFixed(1);

    // Upgrades
    for (const [type, upgrade] of Object.entries(gameState.upgrades)) {
        const levelEl = document.getElementById(`level-${type}`);
        const costEl = document.getElementById(`cost-${type}`);

        if (levelEl) levelEl.textContent = upgrade.level;
        if (costEl) {
            const cost = getUpgradeCost(type);
            costEl.textContent = formatNumber(cost);

            // Glow if affordable
            const upgradeEl = costEl.closest('.upgrade-item');
            if (gameState.coins >= cost) {
                upgradeEl.classList.add('affordable');
            } else {
                upgradeEl.classList.remove('affordable');
            }
        }
    }

    // Prestige button
    const prestigeBtn = document.getElementById('prestige-btn');
    if (gameState.coins >= 100000000) {
        prestigeBtn.classList.add('available');
    } else {
        prestigeBtn.classList.remove('available');
    }

    // Stats
    document.getElementById('stat-total-clicks').textContent = formatNumber(gameState.totalClicks);
    document.getElementById('stat-total-coins').textContent = formatNumber(gameState.totalCoinsEarned);
    document.getElementById('stat-highest-combo').textContent = gameState.highestCombo;
    document.getElementById('stat-prestige-level').textContent = gameState.prestigeLevel;
    document.getElementById('stat-skins-owned').textContent = gameState.ownedSkins.length;
    document.getElementById('stat-skins-total').textContent = Object.keys(SKINS).length;
}

// === TAB SYSTEM ===
function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// === VISUAL EFFECTS ===
function createFloatingText(event, amount, isCrit) {
    const container = document.querySelector('.click-button-container');
    const rect = container.getBoundingClientRect();

    const floatEl = document.createElement('div');
    floatEl.className = 'float-text' + (isCrit ? ' crit' : '');
    floatEl.textContent = `+${formatNumber(amount)}`;
    floatEl.style.left = `${event.clientX - rect.left}px`;
    floatEl.style.top = `${event.clientY - rect.top}px`;

    container.appendChild(floatEl);

    setTimeout(() => floatEl.remove(), 1000);
}

function animateClickButton() {
    const btn = document.getElementById('click-target');
    btn.classList.remove('pulse');
    void btn.offsetWidth; // Trigger reflow
    btn.classList.add('pulse');
}

// === HELPERS ===
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    const text = document.getElementById('notification-text');

    text.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// === TIME TRACKING ===
function startTimeTracking() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000 / 60);
        document.getElementById('stat-time-played').textContent = `${elapsed}m`;
    }, 1000);
}

// === RESET ===
function confirmReset() {
    resetGame();
}

// === GLOBAL EXPOSURE ===
window.initGame = initGame;
window.performClick = performClick;
window.buyUpgrade = buyUpgrade;
window.buySkin = buySkin;
window.switchTab = switchTab;
window.attemptPrestige = attemptPrestige;
window.confirmPrestige = confirmPrestige;
window.closePrestigeModal = closePrestigeModal;
window.buyPremiumItem = buyPremiumItem;
window.closePremiumModal = closePremiumModal;
window.confirmReset = confirmReset;

// === AUTO-INIT ===
window.addEventListener('DOMContentLoaded', initGame);
