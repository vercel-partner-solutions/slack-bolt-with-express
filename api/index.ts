// api/index.js
const express = require('express');
const path = require('path');
const { createHandler } = require('@vercel/slack-bolt');
const { app: boltApp, receiver } = require('../bolt/app');
const { toFetchRequest } = require('../lib/utils');

const app = express();

const handler = createHandler(boltApp, receiver);

app.post("/api/slack/events", async (req, res) => {
    const fetchReq = await toFetchRequest(req);
    const fetchRes = await handler(fetchReq);

    res.status(fetchRes.status);
    fetchRes.headers.forEach((v, k) => res.setHeader(k, v));
    res.send(await fetchRes.text());
});

// Local dev listener (ignored on Vercel)
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

module.exports = app;
