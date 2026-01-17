// ========================================
// CLOUD SAVE & BACKEND INTEGRATION
// ========================================

const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://unremembered-gilda-nonrepressed.ngrok-free.dev';

const tg = window.Telegram?.WebApp;
let currentUserId = null;

// === CLOUD SAVE SYSTEM ===
async function saveToCloud() {
    if (!currentUserId) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                telegramId: currentUserId,
                username: tg?.initDataUnsafe?.user?.username,
                firstName: tg?.initDataUnsafe?.user?.first_name,
                gameState: {
                    coins: gameState.coins,
                    totalCoinsEarned: gameState.totalCoinsEarned,
                    totalClicks: gameState.totalClicks,
                    prestigeLevel: gameState.prestigeLevel,
                    prestigePoints: gameState.prestigePoints,
                    upgrades: gameState.upgrades,
                    ownedSkins: gameState.ownedSkins,
                    equippedSkin: gameState.equippedSkin,
                    highestCombo: gameState.highestCombo,
                    premiumBoosts: gameState.premiumBoosts
                }
            })
        });

        if (response.ok) {
            console.log('☁️ Saved to cloud');
        }
    } catch (error) {
        console.error('Cloud save error:', error);
    }
}

async function loadFromCloud() {
    if (!currentUserId) return false;

    try {
        const response = await fetch(`${BACKEND_URL}/api/load/${currentUserId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const data = await response.json();

        if (data.found && data.gameState) {
            // Merge cloud data with local state
            gameState.coins = data.gameState.coins || 0;
            gameState.totalCoinsEarned = data.gameState.totalCoinsEarned || 0;
            gameState.totalClicks = data.gameState.totalClicks || 0;
            gameState.prestigeLevel = data.gameState.prestigeLevel || 0;
            gameState.prestigePoints = data.gameState.prestigePoints || 0;
            gameState.ownedSkins = data.gameState.ownedSkins || ['default'];
            gameState.equippedSkin = data.gameState.equippedSkin || 'default';
            gameState.highestCombo = data.gameState.highestCombo || 1;
            gameState.premiumBoosts = data.gameState.premiumBoosts || { multiplier24h: false, multiplier24hExpiry: 0 };

            if (data.gameState.upgrades) {
                for (const [key, value] of Object.entries(data.gameState.upgrades)) {
                    if (gameState.upgrades[key]) {
                        gameState.upgrades[key].level = value.level || 0;
                    }
                }
            }

            console.log('☁️ Loaded from cloud');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Cloud load error:', error);
        return false;
    }
}

// === DAILY REWARDS ===
async function checkDailyReward() {
    if (!currentUserId) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/daily-reward`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ telegramId: currentUserId })
        });

        const data = await response.json();

        if (data.canClaim) {
            showDailyRewardModal(data.reward, data.streak);
            gameState.coins += data.reward;
            gameState.totalCoinsEarned += data.reward;
            updateAllUI();
            saveGameState();
            saveToCloud();
        } else if (data.nextReward) {
            const nextDate = new Date(data.nextReward);
            const hours = Math.floor((nextDate - new Date()) / (1000 * 60 * 60));
            console.log(`⏰ Next daily reward in ${hours}h`);
        }
    } catch (error) {
        console.error('Daily reward error:', error);
    }
}

function showDailyRewardModal(reward, streak) {
    const modal = document.getElementById('daily-reward-modal');
    if (!modal) return;

    document.getElementById('daily-reward-amount').textContent = formatNumber(reward);
    document.getElementById('daily-streak').textContent = streak;
    modal.classList.remove('hidden');

    // Confetti effect!
    if (window.confetti) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

function closeDailyRewardModal() {
    document.getElementById('daily-reward-modal').classList.add('hidden');
}

// === LEADERBOARD ===
async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    try {
        console.log('Loading leaderboard from:', `${BACKEND_URL}/api/leaderboard`);

        const response = await fetch(`${BACKEND_URL}/api/leaderboard`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const leaderboard = await response.json();
        console.log('Leaderboard loaded:', leaderboard.length, 'players');

        if (leaderboard.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No players yet. Be the first!</p>';
            return;
        }

        container.innerHTML = leaderboard.map(player => `
            <div class="leaderboard-item ${player.rank <= 3 ? 'top-' + player.rank : ''}">
                <div class="leaderboard-rank">${player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : `#${player.rank}`}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-stats">
                    <span class="leaderboard-coins">${formatNumber(player.coins)} 🪙</span>
                    ${player.prestige > 0 ? `<span class="leaderboard-prestige">⭐${player.prestige}</span>` : ''}
                </div>
            </div>
        `).join('');

        // Load user's rank
        if (currentUserId) {
            loadUserRank();
        }
    } catch (error) {
        console.error('Leaderboard error:', error);
        container.innerHTML = '<p style="text-align: center; opacity: 0.7; color: #ef4444;">⚠️ Unable to load leaderboard.<br>Make sure the backend server is running.</p>';
    }
}

async function loadUserRank() {
    if (!currentUserId) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/rank/${currentUserId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const data = await response.json();

        if (data.rank) {
            const rankEl = document.getElementById('user-rank');
            if (rankEl) {
                rankEl.textContent = `Your Rank: #${data.rank}`;
            }
        }
    } catch (error) {
        console.error('Rank error:', error);
    }
}

// === REFERRAL SYSTEM ===
function getReferralLink() {
    if (!tg || !currentUserId) return null;
    const botUsername = 'NeonGamessBot'; // TODO: Replace with your actual bot username
    return `https://t.me/${botUsername}?start=ref_${currentUserId}`;
}

function shareReferral() {
    const link = getReferralLink();
    if (!link) {
        showNotification('⚠️ Referral not available');
        return;
    }

    const text = `🎮 Join Neon Clicker and get 50,000 bonus coins! I'll get 100,000 too!\n${link}`;

    if (tg) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(link).then(() => {
            showNotification('📋 Link copied!');
        });
    }
}

async function checkReferral() {
    if (!tg || !currentUserId) return;

    const startParam = tg.initDataUnsafe?.start_param;
    if (startParam && startParam.startsWith('ref_')) {
        const referrerId = startParam.replace('ref_', '');

        if (referrerId !== currentUserId) {
            try {
                const response = await fetch(`${BACKEND_URL}/api/referral`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({
                        telegramId: currentUserId,
                        referrerId
                    })
                });

                const data = await response.json();
                if (data.success) {
                    showNotification(`🎁 Welcome! You got ${formatNumber(data.bonus)} bonus coins!`);
                    gameState.coins += data.bonus;
                    gameState.totalCoinsEarned += data.bonus;
                    updateAllUI();
                }
            } catch (error) {
                console.error('Referral error:', error);
            }
        }
    }
}

// === ANIMATED COIN COUNTER ===
let coinCounterInterval = null;
let targetCoins = 0;
let displayedCoins = 0;

function animateCoinCounter(newValue) {
    targetCoins = newValue;

    if (!coinCounterInterval) {
        coinCounterInterval = setInterval(() => {
            const diff = targetCoins - displayedCoins;
            if (Math.abs(diff) < 1) {
                displayedCoins = targetCoins;
                clearInterval(coinCounterInterval);
                coinCounterInterval = null;
            } else {
                displayedCoins += diff * 0.15; // Smooth animation
            }

            document.getElementById('main-score').textContent = formatNumber(Math.floor(displayedCoins));
            document.getElementById('header-coins').textContent = formatNumber(Math.floor(displayedCoins));
        }, 16); // 60 FPS
    }
}

// Override updateAllUI to use animated counter
const originalUpdateAllUI = window.updateAllUI;
window.updateAllUI = function () {
    if (originalUpdateAllUI) {
        originalUpdateAllUI();
    }
    animateCoinCounter(gameState.coins);
};

// === INITIALIZATION ===
function initBackendIntegration() {
    console.log('🚀 Initializing backend integration...');

    if (tg) {
        tg.ready();
        currentUserId = tg.initDataUnsafe?.user?.id?.toString();
        console.log('👤 User ID:', currentUserId);

        // Load from cloud first
        loadFromCloud().then(loaded => {
            if (loaded) {
                updateAllUI();
                renderAllSkins();
                equipSkin(gameState.equippedSkin);
            }

            // Check daily reward (after 2 seconds)
            setTimeout(checkDailyReward, 2000);

            // Check referral
            checkReferral();
        });

        // Auto-save to cloud every 30 seconds
        setInterval(saveToCloud, 30000);
    } else {
        console.log('⚠️ Not in Telegram, using local storage only');
        currentUserId = 'local-user';
    }

    // Attach leaderboard listener (works both in Telegram and browser)
    setTimeout(() => {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            if (btn.textContent.includes('Leaderboard')) {
                console.log('✅ Leaderboard tab found, attaching listener');
                btn.addEventListener('click', () => {
                    console.log('🏆 Leaderboard tab clicked');
                    setTimeout(loadLeaderboard, 100);
                });
            }
        });
    }, 500);
}

// === EXPORTS ===
window.BackendIntegration = {
    saveToCloud,
    loadFromCloud,
    loadLeaderboard,
    shareReferral,
    closeDailyRewardModal
};

// Expose globally for HTML onclick handlers
window.shareReferral = shareReferral;
window.closeDailyRewardModal = closeDailyRewardModal;

// Auto-init
window.addEventListener('DOMContentLoaded', initBackendIntegration);
