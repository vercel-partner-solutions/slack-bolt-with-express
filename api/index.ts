// api/index.js
const express = require('express');
const path = require('path');
const { createHandler } = require('@vercel/slack-bolt');
const { app: boltApp, receiver } = require('../bolt/app');

const app = express();

// Only for the Slack endpoint: keep raw body + add req.text()
app.use('/api/slack/events', express.raw({ type: '*/*' }));
app.use('/api/slack/events', (req, _res, next) => {
    if (typeof req.text !== 'function') {
        // Preserve the raw body as a string for the Fetch-style API
        const bodyString = req.body ? req.body.toString() : '';
        req.text = async () => bodyString;
    }
    next();
});

const handler = createHandler(boltApp, receiver);
app.post('/api/slack/events', handler);

// Local dev listener (ignored on Vercel)
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

module.exports = app;
