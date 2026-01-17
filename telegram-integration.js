// ========================================
// TELEGRAM WEB APP INTEGRATION
// (Testing Mode - Simulated Payments)
// ========================================

const tg = window.Telegram?.WebApp;

// Expose globally for other scripts
window.tg = tg;

// Backend URL is now declared in backend-integration.js to avoid conflicts
// Access it via window if needed in this file

function initTelegramWebApp() {
    if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();

        // Set theme colors
        tg.setHeaderColor('#0f172a');
        tg.setBackgroundColor('#0f172a');

        console.log('✅ Telegram Web App initialized');
        console.log('User:', tg.initDataUnsafe?.user);

        // In production, you would set up:
        // tg.onEvent('invoiceClosed', handleInvoiceClosed);
    } else {
        console.log('⚠️ Not running in Telegram - using standalone mode');
    }
}

// === TELEGRAM STARS INTEGRATION (Simulated) ===

/**
 * In production with backend, this would:
 * 1. Call your backend to create invoice
 * 2. Backend uses telegram.sendInvoice() with currency "XTR"
 * 3. Opens payment UI with tg.openInvoice()
 * 4. Handle pre_checkout_query and successful_payment webhooks
 * 
 * Example backend endpoint:
 * POST /api/create-invoice
 * {
 *   "item": "starter",
 *   "stars": 50,
 *   "userId": tg.initDataUnsafe.user.id
 * }
 */

async function purchaseWithStars(itemId, starsAmount) {
    console.log(`💳 Avvio acquisto: ${itemId} per ${starsAmount} Stars`);

    if (!tg) {
        console.warn('⚠️ Non in ambiente Telegram - simulazione acquisto');
        return simulatePurchase(itemId);
    }

    return new Promise(async (resolve, reject) => {
        try {
            // Use global BACKEND_URL from backend-integration.js
            const BACKEND_URL = window.BACKEND_URL || 'https://unremembered-gilda-nonrepressed.ngrok-free.dev';

            // Chiamata al backend per creare l'invoice
            console.log(`📡 Chiamata a ${BACKEND_URL}/api/create-invoice`);

            const response = await fetch(`${BACKEND_URL}/api/create-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    price: starsAmount,
                    payload: itemId,
                    title: itemId,
                    description: 'Acquisto gioco'
                })
            });

            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Invoice ricevuta:', data);

            // Apri il pagamento Telegram
            tg.openInvoice(data.url, (status) => {
                if (status === 'paid') {
                    console.log('✅ Pagamento completato con successo!');
                    showNotification('✅ Acquisto completato!');
                    resolve(); // ✅ Risolvi SOLO se pagato
                } else if (status === 'cancelled') {
                    console.log('❌ Pagamento annullato dall\'utente');
                    showNotification('❌ Pagamento annullato');
                    reject(new Error('Payment cancelled')); // ❌ Rifiuta se annullato
                } else {
                    console.log('⚠️ Stato pagamento sconosciuto:', status);
                    showNotification('⚠️ Stato pagamento non chiaro');
                    reject(new Error('Payment status unknown'));
                }
            });

        } catch (error) {
            console.error('❌ Errore durante il pagamento:', error);
            showNotification('❌ Errore pagamento: ' + error.message);
            reject(error);
        }
    });
}

function simulatePurchase(itemId) {
    // Simulate 1 second delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`✅ [SIMULATED] Purchase confirmed: ${itemId}`);
            resolve({ success: true, item: itemId });
        }, 1000);
    });
}

// === BACKEND REFERENCE (Node.js Example) ===
/*
// server.js (Backend example)
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const bot = new TelegramBot(process.env.BOT_TOKEN);

app.use(express.json());

// Create invoice endpoint
app.post('/api/create-invoice', async (req, res) => {
    const { item, stars, userId } = req.body;
    
    const invoice = {
        title: `Premium ${item}`,
        description: `Purchase ${item} with Telegram Stars`,
        payload: JSON.stringify({ item, userId }),
        provider_token: '', // Empty for Stars
        currency: 'XTR',
        prices: [{ label: item, amount: stars }]
    };
    
    try {
        const result = await bot.sendInvoice(userId, invoice);
        res.json({ invoiceLink: result.invoice_link });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook handler for pre-checkout
bot.on('pre_checkout_query', async (query) => {
    await bot.answerPreCheckoutQuery(query.id, true);
});

// Webhook handler for successful payment
bot.on('successful_payment', async (message) => {
    const payload = JSON.parse(message.successful_payment.invoice_payload);
    
    // Deliver the item to user
    console.log(`✅ Payment received for ${payload.item} from user ${payload.userId}`);
    
    // Store in database, update user's premium status, etc.
    // Then notify the web app (via long polling, websocket, or next API call)
});

app.listen(3000);
*/

// === HELPER FUNCTIONS ===

function getUserTelegramId() {
    return tg?.initDataUnsafe?.user?.id || 'demo-user';
}

function getUserName() {
    return tg?.initDataUnsafe?.user?.first_name || 'Player';
}

function isTelegramEnvironment() {
    return !!tg;
}

// === INIT ===
window.addEventListener('DOMContentLoaded', () => {
    initTelegramWebApp();
});

// === EXPORTS ===
window.TelegramIntegration = {
    purchaseWithStars,
    getUserTelegramId,
    getUserName,
    isTelegramEnvironment
};
