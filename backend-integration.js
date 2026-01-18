// Test immediato all'avvio
console.log('=== BACKEND INTEGRATION LOADING ===');
console.log('File loaded at:', new Date().toISOString());

// Verifica tutte le dipendenze prima di procedere
setTimeout(() => {
    console.log('=== CHECKING DEPENDENCIES ===');
    console.log('window.Telegram:', !!window.Telegram);
    console.log('window.gameState:', !!window.gameState);
    console.log('window.formatNumber:', typeof window.formatNumber);
    console.log('window.showNotification:', typeof window.showNotification);
    console.log('window.updateAllUI:', typeof window.updateAllUI);
    console.log('window.renderAllSkins:', typeof window.renderAllSkins);
    console.log('window.equipSkin:', typeof window.equipSkin);
    console.log('window.saveGameState:', typeof window.saveGameState);
}, 100);

// Le funzioni esistenti rimangono invariate...
// ========================================
// CLOUD SAVE & BACKEND INTEGRATION
// ========================================

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://unremembered-gilda-nonrepressed.ngrok-free.dev';

// Expose globally so telegram-integration.js can use it
window.BACKEND_URL = BACKEND_URL;

console.log('📡 BACKEND_URL:', BACKEND_URL);

// Use tg from telegram-integration.js (loaded first)
// telegram-integration.js exposes: window.tg = window.Telegram?.WebApp
const tgApp = window.tg;
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
                username: tgApp?.initDataUnsafe?.user?.username,
                firstName: tgApp?.initDataUnsafe?.user?.first_name,
                gameState: {
                    coins: gameState.coins,
                    totalCoinsEarned: gameState.totalCoinsEarned,
                    totalClicks: gameState.totalClicks,
                    prestigeLevel: gameState.prestigeLevel,
                    prestigePoints: gameState.prestigePoints,
                    level: gameState.level,
                    xp: gameState.xp,
                    xpToNextLevel: gameState.xpToNextLevel,
                    levelColor: gameState.levelColor || '#fbbf24',
                    upgrades: gameState.upgrades,
                    ownedSkins: gameState.ownedSkins,
                    equippedSkin: gameState.equippedSkin,
                    highestCombo: gameState.highestCombo,
                    premiumBoosts: gameState.premiumBoosts,
                    playTime: gameState.playTime || 0,
                    lastSaveTime: Date.now() // Timestamp for conflict resolution
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
            // CONFLICT RESOLUTION:
            // Only overwrite local data if cloud data is NEWER or if local data is basically empty (new session)
            const localSaveTime = gameState.lastSaveTime || 0;
            const cloudSaveTime = data.gameState.lastSaveTime || 0;

            // If local progress is significantly higher (e.g. played offline), keep local
            // Using totalCoinsEarned as a proxy for progress if timestamps are messy
            if (gameState.totalCoinsEarned > (data.gameState.totalCoinsEarned || 0) && localSaveTime > cloudSaveTime) {
                console.log('⚠️ Local save is newer/better. Keeping local.');
                // Force a cloud save now to update server
                saveToCloud();
                return false;
            }

            console.log('☁️ Downloading cloud save...');

            gameState.coins = data.gameState.coins || 0;
            gameState.totalCoinsEarned = data.gameState.totalCoinsEarned || 0;
            gameState.totalClicks = data.gameState.totalClicks || 0;
            gameState.prestigeLevel = data.gameState.prestigeLevel || 0;
            gameState.prestigePoints = data.gameState.prestigePoints || 0;

            // Level System
            gameState.level = data.gameState.level || 1;
            gameState.xp = data.gameState.xp || 0;
            gameState.xpToNextLevel = data.gameState.xpToNextLevel || 50;
            gameState.levelColor = data.gameState.levelColor || '#fbbf24';

            gameState.ownedSkins = data.gameState.ownedSkins || ['default'];
            gameState.equippedSkin = data.gameState.equippedSkin || 'default';
            gameState.highestCombo = data.gameState.highestCombo || 1;
            gameState.premiumBoosts = data.gameState.premiumBoosts || { multiplier24h: false, multiplier24hExpiry: 0 };
            gameState.playTime = data.gameState.playTime || 0;
            gameState.lastSaveTime = cloudSaveTime;

            if (data.gameState.upgrades) {
                for (const [key, value] of Object.entries(data.gameState.upgrades)) {
                    if (gameState.upgrades[key]) {
                        gameState.upgrades[key].level = value.level || 0;
                    }
                }
            }

            // Sync UI immediate
            if (window.updateAllUI) window.updateAllUI();
            if (window.updateCoinColors) window.updateCoinColors();

            console.log('☁️ Loaded from cloud successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Cloud load error:', error);
        return false;
    }
}

// Function to reset cloud data
async function resetCloudData() {
    if (!currentUserId) return;

    // We overwrite with a fresh state
    const emptyState = {
        coins: 0,
        totalCoinsEarned: 0,
        level: 1,
        xp: 0,
        upgrades: {}, // Will rely on defaults merging
        lastSaveTime: Date.now()
    };

    try {
        await fetch(`${BACKEND_URL}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegramId: currentUserId,
                username: tgApp?.initDataUnsafe?.user?.username,
                gameState: emptyState
            })
        });
        console.log('☁️ Cloud save reset.');
    } catch (e) {
        console.error('Reset cloud error:', e);
    }
}
window.resetCloudData = resetCloudData;

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
    const modal = document.getElementById('daily-reward-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// === LEADERBOARD ===
async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) {
        console.error('❌ Leaderboard container not found!');
        return;
    }

    try {
        console.log('🏆 Loading leaderboard from:', `${BACKEND_URL}/api/leaderboard`);

        const response = await fetch(`${BACKEND_URL}/api/leaderboard`, {
            method: 'GET',
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json'
            }
        }).catch(err => {
            console.error('❌ Network Error (Fetch failed):', err);
            throw new Error('Network Error: Check if server is running and Ngrok URL is correct.');
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const leaderboard = await response.json();
        console.log('✅ Leaderboard loaded:', leaderboard ? leaderboard.length : 0, 'players');

        if (!leaderboard || leaderboard.length === 0) {
            container.innerHTML = '<div class="leaderboard-empty">No players yet. Be the first!</div>';
            return;
        }

        // Render leaderboard
        container.innerHTML = leaderboard.map((player, index) => {
            // Highlight current user
            const isMe = currentUserId && player.telegramId && player.telegramId.toString() === currentUserId.toString();
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const rowClass = isMe ? 'leaderboard-item me' : 'leaderboard-item';

            return `
            <div class="${rowClass}">
                <div class="rank ${rankClass}">#${player.rank}</div>
                <div class="player-info">
                    <div class="player-name">${player.name} ${isMe ? '(You)' : ''}</div>
                    <div class="player-prestige">⭐ Prestige ${player.prestige || 0}</div>
                </div>
                <div class="player-score">💰 ${formatNumber(player.coins)}</div>
            </div>
            `;
        }).join('');

        // Also update own rank if possible
        if (currentUserId && window.updateUserRank) {
            window.updateUserRank();
        }

    } catch (error) {
        console.error('❌ Leaderboard Loading Error:', error);
        container.innerHTML = `
            <div class="leaderboard-error">
                <p>⚠️ Unable to load leaderboard.</p>
                <p style="font-size: 12px; margin-top: 5px; opacity: 0.7;">
                    ${error.message}
                </p>
                <button onclick="loadLeaderboard()" style="margin-top: 10px; padding: 5px 10px; background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: white;">Try Again</button>
            </div>
        `;
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
    if (!tgApp || !currentUserId) return null;
    const botUsername = 'NeonGamessBot';
    return `https://t.me/${botUsername}?start=ref_${currentUserId}`;
}

function shareReferral() {
    console.log('🎁 === SHARE REFERRAL CALLED ===');
    console.log('tg exists:', !!tgApp);
    console.log('currentUserId:', currentUserId);

    const link = getReferralLink();
    console.log('Generated link:', link);

    if (!link) {
        console.warn('⚠️ No referral link - missing tg or userId');
        showNotification('⚠️ Referral not available');
        return;
    }

    const text = `🎮 Join Neon Clicker and get 50,000 bonus coins! I'll get 100,000 too!\n${link}`;

    if (tgApp) {
        console.log('📱 Opening Telegram share dialog...');
        tgApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
        showNotification('✅ Share dialog opened!');
    } else {
        console.log('📋 Copying to clipboard (not in Telegram)...');
        navigator.clipboard.writeText(link).then(() => {
            console.log('✅ Copied successfully');
            showNotification('📋 Link copied to clipboard!');
        }).catch(err => {
            console.error('Clipboard error:', err);
            alert(`Copy this referral link:\n\n${link}`);
        });
    }
}

async function checkReferral() {
    if (!tgApp || !currentUserId) return;

    const startParam = tgApp.initDataUnsafe?.start_param;
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

            const mainScore = document.getElementById('main-score');
            const headerCoins = document.getElementById('header-coins');
            if (mainScore) mainScore.textContent = formatNumber(Math.floor(displayedCoins));
            if (headerCoins) headerCoins.textContent = formatNumber(Math.floor(displayedCoins));
        }, 16); // 60 FPS
    }
}

// Override updateAllUI to use animated counter
const originalUpdateAllUI = window.updateAllUI;
if (originalUpdateAllUI) {
    window.updateAllUI = function () {
        originalUpdateAllUI();
        animateCoinCounter(gameState.coins);
    };
}

// === INITIALIZATION ===
function initBackendIntegration() {
    console.log('🚀 === BACKEND INTEGRATION INIT ===');

    if (tgApp) {
        tgApp.ready();
        currentUserId = tgApp.initDataUnsafe?.user?.id?.toString();
        console.log('👤 Telegram User ID:', currentUserId);

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
        console.log('🔍 Found', tabBtns.length, 'tab buttons');

        tabBtns.forEach(btn => {
            const btnText = btn.textContent.trim();
            console.log('Tab button:', btnText);

            if (btnText.includes('Leaderboard')) {
                console.log('✅ Leaderboard tab found, attaching listener');
                btn.addEventListener('click', () => {
                    console.log('🏆 Leaderboard tab clicked!');
                    setTimeout(loadLeaderboard, 100);
                });
            }
        });

        // Update status in UI if elements exist
        const statusEl = document.getElementById('backend-status');
        const userIdEl = document.getElementById('user-id-display');

        if (statusEl) {
            statusEl.textContent = '✅ Loaded';
            statusEl.style.color = '#22c55e';
        }

        if (userIdEl && currentUserId) {
            userIdEl.textContent = currentUserId;
        }

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

// CRITICAL: Expose globally for HTML onclick handlers
console.log('📢 Exposing functions globally...');
window.shareReferral = shareReferral;
window.closeDailyRewardModal = closeDailyRewardModal;
window.loadLeaderboard = loadLeaderboard;

console.log('✅ window.shareReferral:', typeof window.shareReferral);
console.log('✅ window.closeDailyRewardModal:', typeof window.closeDailyRewardModal);
console.log('✅ window.loadLeaderboard:', typeof window.loadLeaderboard);

// Auto-init
window.addEventListener('DOMContentLoaded', initBackendIntegration);

console.log('=== BACKEND INTEGRATION LOADED ===');
