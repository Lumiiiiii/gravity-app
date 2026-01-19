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

    // Level System
    level: 1,
    xp: 0,
    xpToNextLevel: 50,
    levelColor: '#fbbf24', // Dynamic color for coins/counter

    // Upgrades
    upgrades: {
        clickPower: { level: 1, baseCost: 20, costMultiplier: 1.5, unlockLevel: 1 },
        critChance: { level: 0, baseCost: 100, costMultiplier: 1.8, unlockLevel: 2 },
        multiplier: { level: 0, baseCost: 500, costMultiplier: 2.0, unlockLevel: 5 },
        comboBonus: { level: 0, baseCost: 1000, costMultiplier: 1.7, unlockLevel: 7 },
        particleEffects: { level: 0, baseCost: 2500, costMultiplier: 2.5, unlockLevel: 10 },
        luckBoost: { level: 0, baseCost: 1500, costMultiplier: 2.2, unlockLevel: 13 },
        speedClick: { level: 0, baseCost: 3000, costMultiplier: 2.8, unlockLevel: 15 },
        megaMultiplier: { level: 0, baseCost: 5000, costMultiplier: 3.0, unlockLevel: 20 },
        autoClicker: { level: 0, baseCost: 50, costMultiplier: 1.5, unlockLevel: 1 } // Basic
    },

    // Skins
    ownedSkins: ['default'],
    equippedSkin: 'default',

    // Stats
    highestCombo: 1,
    playTime: 0, // Track active playtime in seconds

    // Combo System
    combo: 1,
    lastClickTime: 0,
    comboTimeout: null,

    // Premium
    premiumBoosts: {
        multiplier24h: false,
        multiplier24hExpiry: 0,
        fastAutoClick: false, // x2 Auto Click Speed
        fastAutoClickExpiry: 0,
        luckyClicks: false, // x2 Crit Chance
        luckyClicksExpiry: 0
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
        particles: false,
        unlockLevel: 1
    },
    'neon-blue': {
        name: 'Neon Blue',
        rarity: 'common',
        cost: 10000,
        color: '#0ea5e9',
        shadow: 'rgba(14, 165, 233, 0.6)',
        emoji: '💎',
        particles: false,
        bonusDesc: '+5% Coins',
        bonus: { type: 'multiplier', value: 0.05 },
        unlockLevel: 1
    },
    'toxic-green': {
        name: 'Toxic Green',
        rarity: 'common',
        cost: 25000,
        color: '#84cc16',
        shadow: 'rgba(132, 204, 22, 0.6)',
        emoji: '☢️',
        particles: false,
        bonusDesc: '+10% Auto Click',
        bonus: { type: 'autoClick', value: 0.10 },
        unlockLevel: 3
    },
    'hot-pink': {
        name: 'Hot Pink',
        rarity: 'common',
        cost: 50000,
        color: '#ec4899',
        shadow: 'rgba(236, 72, 153, 0.6)',
        emoji: '💖',
        particles: false,
        bonusDesc: '+5% Crit Chance',
        bonus: { type: 'critChance', value: 0.05 },
        unlockLevel: 3
    },
    'electric-violet': {
        name: 'Electric Violet',
        rarity: 'common',
        cost: 75000,
        color: '#8b5cf6',
        shadow: 'rgba(139, 92, 246, 0.6)',
        emoji: '⚡',
        particles: false,
        unlockLevel: 3
    },
    'ocean-breeze': {
        name: 'Ocean Breeze',
        rarity: 'common',
        cost: 90000,
        color: '#06b6d4',
        shadow: 'rgba(6, 182, 212, 0.6)',
        emoji: '🌊',
        particles: false,
        bonusDesc: '+20% Auto Click',
        bonus: { type: 'autoClick', value: 0.20 },
        unlockLevel: 6
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
        particleColor: '#fbbf24',
        bonusDesc: '+20% Coins',
        bonus: { type: 'multiplier', value: 0.20 },
        unlockLevel: 10 // Based on progression gap
    },
    'purple-haze': {
        name: 'Purple Haze',
        rarity: 'rare',
        cost: 200000,
        color: '#a855f7',
        shadow: 'rgba(168, 85, 247, 0.7)',
        emoji: '🔮',
        particles: true,
        particleColor: '#c084fc',
        bonusDesc: '+10% Crit Chance',
        bonus: { type: 'critChance', value: 0.10 },
        unlockLevel: 10
    },
    'cyber-cyan': {
        name: 'Cyber Cyan',
        rarity: 'rare',
        cost: 350000,
        color: '#06b6d4',
        shadow: 'rgba(6, 182, 212, 0.7)',
        emoji: '🌊',
        particles: true,
        particleColor: '#22d3ee',
        bonusDesc: '+25% Auto Click',
        bonus: { type: 'autoClick', value: 0.25 },
        unlockLevel: 10
    },
    'crimson-fury': {
        name: 'Crimson Fury',
        rarity: 'rare',
        cost: 500000,
        color: '#dc2626',
        shadow: 'rgba(220, 38, 38, 0.7)',
        emoji: '🔥',
        particles: true,
        particleColor: '#ef4444',
        bonusDesc: '+15% Crit Chance',
        bonus: { type: 'critChance', value: 0.15 },
        unlockLevel: 15
    },
    'solar-flare': {
        name: 'Solar Flare',
        rarity: 'rare',
        cost: 650000,
        color: '#fb923c',
        shadow: 'rgba(251, 146, 60, 0.7)',
        emoji: '☀️',
        particles: true,
        bonusDesc: '+30% Coins',
        bonus: { type: 'multiplier', value: 0.30 },
        unlockLevel: 15
    },
    'midnight-shadow': {
        name: 'Midnight Shadow',
        rarity: 'rare',
        cost: 800000,
        color: '#6366f1',
        shadow: 'rgba(99, 102, 241, 0.7)',
        emoji: '🌙',
        particles: true,
        particleColor: '#818cf8',
        bonusDesc: '+25% Coins',
        bonus: { type: 'multiplier', value: 0.25 },
        unlockLevel: 17
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
        bonusDesc: '+50% Auto Click',
        bonus: { type: 'autoClick', value: 0.50 },
        unlockLevel: 20
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
        particleColor: '#fb923c',
        bonusDesc: '+40% Auto Click',
        bonus: { type: 'autoClick', value: 0.40 },
        unlockLevel: 20
    },
    'dragon-soul': {
        name: 'Dragon Soul',
        rarity: 'epic',
        cost: 3500000,
        color: '#dc2626',
        shadow: 'rgba(220, 38, 38, 0.9)',
        gradient: 'linear-gradient(45deg, #dc2626, #f97316, #fbbf24)',
        emoji: '🐲',
        particles: true,
        particleColor: '#f87171',
        bonusDesc: '+20% Crit Chance',
        bonus: { type: 'critChance', value: 0.20 },
        unlockLevel: 20
    },
    'ice-crystal': {
        name: 'Ice Crystal',
        rarity: 'epic',
        cost: 4000000,
        color: '#0ea5e9',
        shadow: 'rgba(14, 165, 233, 0.9)',
        gradient: 'linear-gradient(45deg, #0ea5e9, #06b6d4, #ecfeff)',
        emoji: '❄️',
        particles: true,
        particleColor: '#38bdf8',
        bonusDesc: '+40% Coins',
        bonus: { type: 'multiplier', value: 0.40 },
        unlockLevel: 23
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
        particleColor: '#a78bfa',
        bonusDesc: '+75% Auto Click',
        bonus: { type: 'autoClick', value: 0.75 },
        unlockLevel: 25
    },

    // LEGENDARY
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
        special: 'rain',
        bonusDesc: '+50% Coins & +20% Crit',
        bonus: { type: 'multiplier', value: 0.50 },
        unlockLevel: 30
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
        special: 'rainbow',
        bonusDesc: '2x ALL COINS',
        bonus: { type: 'multiplier', value: 1.0 },
        unlockLevel: 1
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
        special: 'stars',
        bonusDesc: '2x CRIT CHANCE',
        bonus: { type: 'critChance', value: 1.0 },
        unlockLevel: 1
    }
};

// === INITIALIZATION ===
function initGame() {
    loadGameState();
    renderAllSkins();
    updateAllUI();
    updateAllUI();
    // updateCoinColors(); // Moved to equipSkin logic
    startAutoClicker();
    startTimeTracking();

    // Ensure skin theme is applied on load
    equipSkin(gameState.equippedSkin);

    // Auto-save every 5 seconds
    setInterval(saveGameState, 5000);

    // Enable multi-touch
    initMultiTouch();
}

// === SAVE/LOAD SYSTEM ===
function saveGameState() {
    localStorage.setItem('neonClickerSave', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('neonClickerSave');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);

            // CRITICAL: Merge saved data carefully to avoid overriding defaults
            gameState.coins = loaded.coins || 0;
            gameState.totalCoinsEarned = loaded.totalCoinsEarned || 0;
            gameState.totalClicks = loaded.totalClicks || 0;
            gameState.prestigeLevel = loaded.prestigeLevel || 0;
            gameState.prestigeLevel = loaded.prestigeLevel || 0;
            gameState.prestigePoints = loaded.prestigePoints || 0;
            gameState.level = loaded.level || 1;
            gameState.xp = loaded.xp || 0;
            gameState.xpToNextLevel = loaded.xpToNextLevel || 50;
            gameState.levelColor = loaded.levelColor || '#fbbf24';
            gameState.ownedSkins = loaded.ownedSkins || ['default'];
            gameState.equippedSkin = loaded.equippedSkin || 'default';
            gameState.highestCombo = loaded.highestCombo || 1;
            gameState.playTime = loaded.playTime || 0;

            // Merge upgrades (preserve new upgrades if they don't exist in save)
            if (loaded.upgrades) {
                for (const [key, value] of Object.entries(loaded.upgrades)) {
                    if (gameState.upgrades[key]) {
                        gameState.upgrades[key].level = value.level;
                    }
                }
            }

            // Premium boosts
            if (loaded.premiumBoosts) {
                gameState.premiumBoosts = loaded.premiumBoosts;
                const now = Date.now();

                // Check Expiries
                if (gameState.premiumBoosts.multiplier24hExpiry < now) gameState.premiumBoosts.multiplier24h = false;
                if (gameState.premiumBoosts.fastAutoClickExpiry < now) gameState.premiumBoosts.fastAutoClick = false;
                if (gameState.premiumBoosts.luckyClicksExpiry < now) gameState.premiumBoosts.luckyClicks = false;
            }
        } catch (error) {
            console.error('Error loading save:', error);
            // If parse error, reset to defaults
        }
    }
}

async function resetGame() {
    if (confirm('⚠️ Are you sure? This will delete ALL progress!')) {
        // 1. Clear Local Storage
        localStorage.removeItem('neonClickerSave');

        // 2. Clear Cloud Save (if connected)
        if (window.resetCloudData) {
            showNotification('🧹 Wiping cloud data...');
            await window.resetCloudData();
        }

        // 3. Reload
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
    gameState.totalCoinsEarned += earnedCoins;
    gameState.totalClicks++;

    // Add XP
    addXp(1);

    // Combo System
    updateCombo();

    // Visual feedback
    createFloatingText(event, earnedCoins, isCrit);
    animateClickButton();

    // Particle effects if purchased
    if (gameState.upgrades.particleEffects.level > 0) {
        createParticles(event);
    }

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
    const clickButton = document.getElementById('click-target');

    comboValue.textContent = gameState.combo;

    if (gameState.combo > 1) {
        comboIndicator.classList.add('active');
        if (gameState.combo >= 10) comboIndicator.classList.add('mega');
        else comboIndicator.classList.remove('mega');

        // DYNAMIC SCALING: Button grows with combo
        // Reduced scaling to prevent overlap (max +15% instead of +50%)
        const scaleBonus = Math.min(gameState.combo / 200, 0.15);
        const scale = 1.0 + scaleBonus;
        if (clickButton) {
            // Use setProperty with 'important' to override CSS
            clickButton.style.setProperty('transform', `scale(${scale})`, 'important');
            clickButton.style.setProperty('transition', 'transform 0.3s ease', 'important');
        }
    } else {
        comboIndicator.classList.remove('active');
        comboIndicator.classList.remove('mega');

        // Reset to normal size
        if (clickButton) {
            clickButton.style.setProperty('transform', 'scale(1.0)', 'important');
        }
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

        // Remove 'affordable' class temporarily and re-add after UI update
        const upgradeEl = document.querySelector(`[onclick="buyUpgrade('${upgradeType}')"]`);
        if (upgradeEl) {
            upgradeEl.classList.remove('affordable');
            // Flash effect
            upgradeEl.style.transform = 'scale(1.05)';
            setTimeout(() => {
                upgradeEl.style.transform = '';
            }, 200);
        }
    } else {
        showNotification('❌ Not enough coins!');
    }
}

function getUpgradeCost(upgradeType) {
    const upgrade = gameState.upgrades[upgradeType];
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level - 1));
}

function addXp(amount) {
    gameState.xp += amount;
    if (gameState.xp >= gameState.xpToNextLevel) {
        gameState.xp -= gameState.xpToNextLevel;
        gameState.level++;

        // BALANCED XP FORMULA: Base 50, scales with power 1.5
        // Level 1 -> 50, 2 -> 141, 10 -> 1581, 30 -> ~8000
        gameState.xpToNextLevel = Math.floor(50 * Math.pow(gameState.level, 1.5));

        // RANDOM COLOR ON LEVEL UP REMOVED -> Skin Theme handles it now

        showNotification(`🆙 LEVEL UP! Lvl ${gameState.level} (+1% Power)`);
        createParticles({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }); // Celebration

        // Refresh UI to show unlocked items
        renderAllSkins();
        updateAllUI();
    }
}

function updateCoinColors(baseColor, darkColor, brightColor) {
    const color = baseColor || gameState.levelColor || '#fbbf24';
    const dark = darkColor || color;
    // const bright = brightColor || color; // Use if needed

    // 1. Update Text Colors (Score & Header)
    // User Request: Coin Number in Dark Green (Dark Color)
    const textElements = [
        document.getElementById('main-score'),
        document.getElementById('header-coins')
    ];

    textElements.forEach(el => {
        if (el) {
            el.style.color = dark; // Use Darker variant for numbers

            // Add stroke for readability using text-shadow (cleaner than webkitTextStroke)
            // 4 shadows for outline + original glow
            el.style.webkitTextStroke = '0px';
            el.style.textShadow = `
                -1px -1px 0 #000,  
                 1px -1px 0 #000,
                -1px  1px 0 #000,
                 1px  1px 0 #000,
                 0 0 10px ${color}
            `;

            el.style.transition = 'color 0.5s ease, text-shadow 0.5s ease';
        }
    });

    // 2. Update Coin Icons (Header & Main)
    // We use drop-shadow because we can't easily recolor a native emoji (or img now)
    const iconElements = [
        document.querySelector('.header-stats .stat-box:first-child .stat-icon'), // Header Icon
        document.querySelector('.score-display .coin-icon'),                      // Main Score Icon
        document.querySelector('.header-stats .stat-box img.cat-coin-img'),
        document.querySelector('.score-display img.cat-coin-img')
    ];

    iconElements.forEach(el => {
        if (el) {
            el.style.filter = `drop-shadow(0 0 8px ${color})`;
            el.style.transition = 'filter 0.5s ease';
            // Optional: rotate slightly to indicate change
            el.style.transform = 'scale(1.1)';
            setTimeout(() => el.style.transform = 'scale(1)', 300);
        }
    });

    // 3. Update 'coins per sec' text too if desired, or keep it subtle
    const cpsEl = document.getElementById('cps-display');
    if (cpsEl) {
        cpsEl.style.color = color;
    }

    // 4. Update Multipliers (Stats)
    const statMulti = document.getElementById('stat-multi');
    if (statMulti) {
        statMulti.style.color = color;
    }
}

// === CALCULATIONS ===
function getClickPower() {
    let power = gameState.upgrades.clickPower.level * getGlobalMultiplier();

    // Level Bonus (+1% per level)
    power *= (1 + (gameState.level - 1) * 0.01);

    return power;
}

function getAutoClickerPower() {
    let power = gameState.upgrades.autoClicker.level * getGlobalMultiplier();

    // Skin Bonus
    const equippedSkin = SKINS[gameState.equippedSkin];
    if (equippedSkin && equippedSkin.bonus && equippedSkin.bonus.type === 'autoClick') {
        power *= (1 + equippedSkin.bonus.value);
    }

    if (gameState.premiumBoosts.fastAutoClick) power *= 2;
    return power;
}

function getCritChance() {
    const base = gameState.upgrades.critChance.level * 0.02;
    const luck = gameState.upgrades.luckBoost.level * 0.03; // New luck upgrade
    let chance = base + luck;

    // Skin Bonus
    const equippedSkin = SKINS[gameState.equippedSkin];
    if (equippedSkin && equippedSkin.bonus && equippedSkin.bonus.type === 'critChance') {
        chance += equippedSkin.bonus.value;
    }

    if (gameState.premiumBoosts.luckyClicks) chance *= 2; // Lucky Clicks Boost

    return Math.min(0.75, chance); // Max 75%
}

function getGlobalMultiplier() {
    let multi = 1;
    multi += gameState.upgrades.multiplier.level * 0.1;
    multi += gameState.upgrades.megaMultiplier.level * 0.15; // New upgrade
    multi += gameState.prestigePoints * 0.1; // 10% per prestige point

    // Skin Bonus
    const equippedSkin = SKINS[gameState.equippedSkin];
    if (equippedSkin && equippedSkin.bonus && equippedSkin.bonus.type === 'multiplier') {
        multi += equippedSkin.bonus.value;
    }

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

    // PERSISTENCE CHECK: We save Level/XP before resetting
    const savedLevel = gameState.level;
    const savedXp = gameState.xp;
    const savedXpReq = gameState.xpToNextLevel;
    const savedColor = gameState.levelColor;

    // Reset keeping upgrades definition which now includes unlockLevels
    gameState.coins = 0;
    gameState.totalClicks = 0;
    gameState.combo = 1;
    gameState.upgrades = {
        clickPower: { level: 1, baseCost: 20, costMultiplier: 1.5, unlockLevel: 1 },
        autoClicker: { level: 0, baseCost: 50, costMultiplier: 1.5, unlockLevel: 1 },
        critChance: { level: 0, baseCost: 100, costMultiplier: 1.8, unlockLevel: 2 },
        multiplier: { level: 0, baseCost: 500, costMultiplier: 2.0, unlockLevel: 5 },
        comboBonus: { level: 0, baseCost: 1000, costMultiplier: 1.7, unlockLevel: 7 },
        particleEffects: { level: 0, baseCost: 2500, costMultiplier: 2.5, unlockLevel: 10 },
        luckBoost: { level: 0, baseCost: 1500, costMultiplier: 2.2, unlockLevel: 13 },
        speedClick: { level: 0, baseCost: 3000, costMultiplier: 2.8, unlockLevel: 15 },
        megaMultiplier: { level: 0, baseCost: 5000, costMultiplier: 3.0, unlockLevel: 20 }
    };

    // Restore Persistent Data
    gameState.level = savedLevel;
    gameState.xp = savedXp;
    gameState.xpToNextLevel = savedXpReq;
    gameState.levelColor = savedColor;

    // Keep skins, premium status
    // Gain prestige
    gameState.prestigeLevel++;
    gameState.prestigePoints += pointsGain;

    closePrestigeModal();
    showNotification(`⭐ PRESTIGED! +${pointsGain} Prestige Points!`);
    updateAllUI();

    // Ensure theme persists
    if (gameState.equippedSkin) equipSkin(gameState.equippedSkin);
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

    // Level checking logic
    const unlockLevel = skin.unlockLevel || 1;
    const isLocked = gameState.level < unlockLevel;

    if (isOwned) div.classList.add('owned');
    if (isEquipped) div.classList.add('equipped');
    if (isLocked) div.classList.add('locked');

    // Add rarity class for animations
    div.classList.add(skin.rarity);

    const previewStyle = skin.gradient
        ? `background: ${skin.gradient};`
        : `background: ${skin.color}; box-shadow: 0 0 15px ${skin.shadow};`;

    const costText = typeof skin.cost === 'number'
        ? formatNumber(skin.cost)
        : '💎 Premium';

    // Image Handling for Shop
    const skinImageSrc = skinId === 'default' ? 'cat-coin.png' : `skin-${skinId}.png`;

    // We use an img tag with fallback to emoji if image fails to load
    div.innerHTML = `
        <div class="skin-preview" style="${previewStyle}">
            <img src="${skinImageSrc}" alt="${skin.name}" class="skin-preview-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <span class="skin-emoji-fallback" style="display:none; font-size: 2rem;">${skin.emoji}</span>
            ${isLocked ? `<div class="lock-overlay"><span class="lock-icon">🔒</span><span class="lock-text">Lv ${unlockLevel}</span></div>` : ''}
        </div>
        <p class="skin-name">${skin.name}</p>
        <p class="skin-bonus" style="font-size: 10px; color: #fbbf24; margin-bottom: 4px;">${skin.bonusDesc || ''}</p>
        <span class="skin-cost">${isOwned ? (isEquipped ? 'EQUIPPED' : 'OWNED') : (isLocked ? `Lv ${unlockLevel}` : costText)}</span>
    `;

    return div;
}

function buySkin(skinId) {
    const skin = SKINS[skinId];
    if (!skin) return;

    // Check Level Lock
    const unlockLevel = skin.unlockLevel || 1;
    if (gameState.level < unlockLevel) {
        showNotification(`🔒 Need Level ${unlockLevel} to unlock!`);
        return;
    }

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

    // Determine image source (for now use cat-coin.png, later will be skin-specific)
    // Format: skin-{skinId}.png (e.g., skin-neon-blue.png)
    const skinImageSrc = skinId === 'default' ? 'cat-coin.png' : `skin-${skinId}.png`;

    // Update ALL coin icons
    const headerCoinIcon = document.querySelector('.header-stats .stat-box img.cat-coin-img');
    const mainScoreCoinIcon = document.querySelector('.score-display img.cat-coin-img');
    const clickButtonImg = document.getElementById('click-button-img');

    const updateImage = (imgElement) => {
        if (!imgElement) return;
        imgElement.src = skinImageSrc;
        imgElement.onerror = () => {
            imgElement.src = 'cat-coin.png'; // Fallback to default if skin image missing
            imgElement.onerror = null; // Prevent infinite loop
        };
    };

    if (headerCoinIcon) updateImage(headerCoinIcon);
    if (mainScoreCoinIcon) updateImage(mainScoreCoinIcon);
    if (clickButtonImg) updateImage(clickButtonImg);

    // Update button styling
    const btn = document.getElementById('click-target');

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

    // Apply Theme Colors
    applyTheme(skin.color);
}

// === PREMIUM SYSTEM (Simulated) ===
let currentPremiumItem = null;

function buyPremiumItem(itemId) {
    currentPremiumItem = itemId;

    const items = {
        'coinbooster': { name: '💰 Coin Booster', stars: 10, coins: 1000000 },
        'starter': { name: '🌟 Starter Pack', stars: 25, coins: 1000000, skin: 'random-common' },
        'megaboost': { name: '⚡ Mega Boost', stars: 50, effect: '24h-2x', description: '2x Coins for 24h' },
        'legendary': { name: '💫 Legendary Pack', stars: 100, skins: ['rainbow', 'cosmic'], description: '2 Exclusive Skins' },
        'prestige': { name: '🎆 Prestige Booster', stars: 75, prestigePoints: 5, description: '+5 Prestige Points' },
        'ultimate': { name: '🔥 Ultimate Bundle', stars: 250, all: true, description: '100M Coins + ALL Boosts + Skins' }
    };

    const item = items[itemId];

    // Chiama la funzione REALE dal telegram-integration.js
    if (window.TelegramIntegration && window.TelegramIntegration.purchaseWithStars) {
        window.TelegramIntegration.purchaseWithStars(itemId, item.stars)
            .then(() => {
                // Se il pagamento va a buon fine, consegna l'item
                deliverPremiumItem(itemId, item);
            })
            .catch(error => {
                console.error('Errore pagamento:', error);
                showNotification('❌ Errore durante il pagamento');
            });
    } else {
        alert('⚠️ Telegram Integration non trovato! File non caricato?');
        showNotification('⚠️ Sistema di pagamento non disponibile');
    }
}

function deliverPremiumItem(itemId, item) {
    // Consegna gli item dopo pagamento confermato
    showNotification(`✨ Acquisto completato: ${item.name}!`);

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
        // ULTIMATE BUNDLE UPDATE
        gameState.coins += 100000000; // 100 MILLION
        gameState.prestigePoints += 10;

        // 1. Coin Multiplier (24h)
        gameState.premiumBoosts.multiplier24h = true;
        gameState.premiumBoosts.multiplier24hExpiry = Date.now() + (24 * 60 * 60 * 1000);

        // 2. Fast Auto Click (24h)
        gameState.premiumBoosts.fastAutoClick = true;
        gameState.premiumBoosts.fastAutoClickExpiry = Date.now() + (24 * 60 * 60 * 1000);

        // 3. Lucky Clicks (24h)
        gameState.premiumBoosts.luckyClicks = true;
        gameState.premiumBoosts.luckyClicksExpiry = Date.now() + (24 * 60 * 60 * 1000);

        // Skins
        ['rainbow', 'cosmic', 'matrix'].forEach(skinId => {
            if (!gameState.ownedSkins.includes(skinId)) {
                gameState.ownedSkins.push(skinId);
            }
        });
        showNotification('🔥 ULTIMATE BUNDLE ACTIVATED!');
    }

    updateAllUI();
    renderAllSkins();
}

function closePremiumModal() {
    document.getElementById('premium-modal').classList.add('hidden');
}

// === UI UPDATES (OPTIMIZED) ===
function updateAllUI() {
    // Batch DOM updates for better performance
    requestAnimationFrame(() => {
        // Header
        document.getElementById('header-coins').textContent = formatNumber(gameState.coins);
        document.getElementById('header-prestige').textContent = gameState.prestigeLevel;
        if (document.getElementById('header-level')) {
            document.getElementById('header-level').textContent = gameState.level;

            // Update Progress Bar
            const progress = Math.min(100, Math.max(0, (gameState.xp / gameState.xpToNextLevel) * 100));
            const progressBar = document.getElementById('level-progress-bar');
            if (progressBar) progressBar.style.width = `${progress}%`;

            // Update XP Text
            const xpText = document.getElementById('xp-text');
            if (xpText) xpText.textContent = `${Math.floor(gameState.xp)}/${Math.floor(gameState.xpToNextLevel)}`;
        }

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
            const unlockLevel = upgrade.unlockLevel || 1;
            const isLocked = gameState.level < unlockLevel;

            if (levelEl) levelEl.textContent = upgrade.level;

            if (costEl) {
                const upgradeEl = costEl.closest('.upgrade-item');

                if (isLocked && upgradeEl) {
                    upgradeEl.classList.add('locked-upgrade');
                    // Add lock overlay if not present
                    if (!upgradeEl.querySelector('.lock-overlay')) {
                        const overlay = document.createElement('div');
                        overlay.className = 'lock-overlay';
                        overlay.innerHTML = `<span class="lock-icon">🔒</span><span>Lv ${unlockLevel}</span>`;
                        upgradeEl.appendChild(overlay);
                    }
                } else if (!isLocked && upgradeEl) {
                    upgradeEl.classList.remove('locked-upgrade');
                    const overlay = upgradeEl.querySelector('.lock-overlay');
                    if (overlay) overlay.remove();

                    const cost = getUpgradeCost(type);
                    costEl.textContent = formatNumber(cost);

                    // Glow if affordable
                    if (gameState.coins >= cost) {
                        upgradeEl.classList.add('affordable');
                    } else {
                        upgradeEl.classList.remove('affordable');
                    }
                }
            }
        }

        // Prestige button
        const prestigeBtn = document.getElementById('prestige-btn');
        if (prestigeBtn) {
            if (gameState.coins >= 100000000) {
                prestigeBtn.classList.add('available');
            } else {
                prestigeBtn.classList.remove('available');
            }
        }

        // Stats (only update if stats tab is visible - performance)
        const statsTab = document.getElementById('tab-stats');
        if (statsTab && statsTab.classList.contains('active')) {
            document.getElementById('stat-total-clicks').textContent = formatNumber(gameState.totalClicks);
            document.getElementById('stat-total-coins').textContent = formatNumber(gameState.totalCoinsEarned);
            document.getElementById('stat-highest-combo').textContent = gameState.highestCombo;
            document.getElementById('stat-prestige-level').textContent = gameState.prestigeLevel;
            document.getElementById('stat-skins-owned').textContent = gameState.ownedSkins.length;
            document.getElementById('stat-skins-total').textContent = Object.keys(SKINS).length;
        }
    });
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

    // Dynamic Skin Theme Colors
    if (isCrit) {
        floatEl.style.color = 'var(--theme-bright, #fff)';
        floatEl.style.textShadow = '0 0 10px var(--theme-base, #fca5a5)';
    } else {
        floatEl.style.color = 'var(--theme-base, #fff)';
    }

    container.appendChild(floatEl);

    setTimeout(() => floatEl.remove(), 1000);
}

function animateClickButton() {
    const btn = document.getElementById('click-target');
    btn.classList.remove('pulse');
    void btn.offsetWidth; // Trigger reflow
    btn.classList.add('pulse');
}

// === PARTICLE EFFECTS (OPTIMIZED + SKIN-SPECIFIC) ===
function createParticles(event) {
    const container = document.querySelector('.click-button-container');
    const rect = container.getBoundingClientRect();

    // Get current skin data
    const currentSkin = SKINS[gameState.equippedSkin];
    const particleColor = currentSkin?.particleColor || currentSkin?.color || '#fca5a5';
    const rarity = currentSkin?.rarity || 'common';

    // Reduced particles for performance: max 8 base + 1 per level
    const baseCount = rarity === 'legendary' ? 8 : rarity === 'epic' ? 6 : 4;
    const particleCount = Math.min(baseCount + gameState.upgrades.particleEffects.level, 12);

    // Create particles
    requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `particle p${(i % 8) + 1}`;
            particle.style.backgroundColor = particleColor;
            particle.style.left = `${event.clientX - rect.left}px`;
            particle.style.top = `${event.clientY - rect.top}px`;
            particle.style.boxShadow = `0 0 8px ${particleColor}`;

            fragment.appendChild(particle);
        }

        container.appendChild(fragment);

        // Cleanup particles after animation (600ms)
        setTimeout(() => {
            const particles = container.querySelectorAll('.particle');
            particles.forEach(p => p.remove());
        }, 600);
    });

    // Add special effects based on rarity
    if (gameState.upgrades.particleEffects.level > 0) {
        addSkinSpecificEffect(event, rect, particleColor, rarity);
    }
}

// Skin-specific visual effects
function addSkinSpecificEffect(event, rect, color, rarity) {
    const container = document.querySelector('.click-button-container');

    // RARE: Subtle ripple
    if (rarity === 'rare') {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.borderColor = color;
        ripple.style.left = `${event.clientX - rect.left - 20}px`;
        ripple.style.top = `${event.clientY - rect.top - 20}px`;
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // EPIC: Double ripple + glow
    else if (rarity === 'epic') {
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const ripple = document.createElement('div');
                ripple.className = 'ripple-effect';
                ripple.style.borderColor = color;
                ripple.style.left = `${event.clientX - rect.left - 20}px`;
                ripple.style.top = `${event.clientY - rect.top - 20}px`;
                ripple.style.borderWidth = '3px';
                container.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }, i * 100);
        }
    }

    // LEGENDARY: Screen shake + ripple + intensified glow
    else if (rarity === 'legendary') {
        // Screen shake
        const gameContainer = document.querySelector('.click-zone');
        if (gameContainer) {
            gameContainer.classList.add('shake-effect');
            setTimeout(() => gameContainer.classList.remove('shake-effect'), 300);
        }

        // Triple ripple
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ripple = document.createElement('div');
                ripple.className = 'ripple-effect';
                ripple.style.borderColor = color;
                ripple.style.left = `${event.clientX - rect.left - 20}px`;
                ripple.style.top = `${event.clientY - rect.top - 20}px`;
                ripple.style.borderWidth = '4px';
                ripple.style.boxShadow = `0 0 20px ${color}`;
                container.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }, i * 80);
        }

        // Intensify click button glow temporarily
        const btn = document.getElementById('click-target');
        const originalShadow = btn.style.boxShadow;
        btn.style.boxShadow = `0 0 80px ${color}, 0 0 120px ${color}`;
        setTimeout(() => btn.style.boxShadow = originalShadow, 200);
    }
}

// === THEME SYSTEM ===
function applyTheme(hexColor) {
    if (!hexColor) return;

    gameState.levelColor = hexColor; // Update the state property used by legacy functions

    // Generate variants
    // Simple brightness adjustment: positive % is lighter, negative % is darker
    const brightColor = adjustBrightness(hexColor, 50); // +50% brightness
    const darkColor = adjustBrightness(hexColor, -30); // -30% darkness

    // Set CSS Variables for global usage
    const r = document.documentElement;
    r.style.setProperty('--theme-base', hexColor);
    r.style.setProperty('--theme-bright', brightColor);
    r.style.setProperty('--theme-dark', darkColor);
    r.style.setProperty('--theme-glow', `${hexColor}80`); // 50% opacity

    // Update specific UI components as requested
    updateCoinColors(hexColor, darkColor, brightColor);
}

function adjustBrightness(hex, percent) {
    hex = hex.replace(/^\s*#|\s*$/g, '');
    if (hex.length === 3) hex = hex.replace(/(.)/g, '$1$1');

    const num = parseInt(hex, 16);
    let r = (num >> 16) + Math.round(2.55 * percent);
    let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
    let b = (num & 0x0000FF) + Math.round(2.55 * percent);

    // Clamp to 0-255
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return '#' + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
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
        // Increment active play time
        gameState.playTime = (gameState.playTime || 0) + 1;

        const minutes = Math.floor(gameState.playTime / 60);
        const hours = Math.floor(minutes / 60);

        const display = hours > 0
            ? `${hours}h ${minutes % 60}m`
            : `${minutes}m`;

        const el = document.getElementById('stat-time-played');
        if (el) el.textContent = display;
    }, 1000);
}

// === RESET ===
function confirmReset() {
    resetGame();
}

// === MULTI-TOUCH SUPPORT ===
function initMultiTouch() {
    const clickButton = document.getElementById('click-target');
    if (!clickButton) return;

    // Disable default onclick to prevent conflicts
    clickButton.onclick = null;

    // Track active touches to prevent double-firing
    const activeTouches = new Set();

    // Handle touch events for multi-finger support
    clickButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default to avoid conflicts

        // Process each new touch point
        Array.from(e.changedTouches).forEach(touch => {
            const touchId = touch.identifier;

            // Only process if this touch is new
            if (!activeTouches.has(touchId)) {
                activeTouches.add(touchId);

                // Create a synthetic event with proper coordinates
                const syntheticEvent = {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    target: clickButton
                };

                performClick(syntheticEvent);
            }
        });
    }, { passive: false });

    // Clean up ended touches
    clickButton.addEventListener('touchend', (e) => {
        Array.from(e.changedTouches).forEach(touch => {
            activeTouches.delete(touch.identifier);
        });
    });

    clickButton.addEventListener('touchcancel', (e) => {
        Array.from(e.changedTouches).forEach(touch => {
            activeTouches.delete(touch.identifier);
        });
    });

    // Keep mouse/click support for desktop
    clickButton.addEventListener('click', (e) => {
        performClick(e);
    });
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
