// ========================================
// TELEGRAM WEB APP INTEGRATION
// (Testing Mode - Simulated Payments)
// ========================================

const tg = window.Telegram?.WebApp;

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
    console.log(`[SIMULATED] Purchasing ${itemId} for ${starsAmount} Stars`);

    if (!tg) {
        console.warn('Not in Telegram environment - simulating purchase');
        return simulatePurchase(itemId);
    }

    try {
        // In production, this would be:
        // const response = await fetch('/api/create-invoice', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         item: itemId,
        //         stars: starsAmount,
        //         userId: tg.initDataUnsafe.user.id
        //     })
        // });
        // 
        // const { invoiceLink } = await response.json();
        // 
        // tg.openInvoice(invoiceLink, (status) => {
        //     if (status === 'paid') {
        //         // Payment successful
        //         console.log('✅ Payment successful!');
        //         deliverPremiumItem(itemId);
        //     } else {
        //         console.log('❌ Payment cancelled or failed');
        //     }
        // });

        // For testing, simulate
        return simulatePurchase(itemId);

    } catch (error) {
        console.error('Payment error:', error);
        showNotification('❌ Payment failed!');
    }
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
