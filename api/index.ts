// api/index.js
const express = require('express');
const path = require('path');
const { createHandler } = require('@vercel/slack-bolt');
const { app: boltApp, receiver } = require('../bolt/app');

const app = express();
app.use(express.text());

const handler = createHandler(boltApp, receiver);
app.post('/api/slack/events', handler);

// Local dev listener (ignored on Vercel)
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

module.exports = app;
