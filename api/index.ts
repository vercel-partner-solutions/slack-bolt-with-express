// api/index.js
const express = require('express');
const { createHandler } = require('@vercel/slack-bolt');
const { app: boltApp, receiver } = require('../bolt/app');
const { toFetchRequest, sendFetchResponse } = require('../lib/utils');

const app = express();

const slackHandler = createHandler(boltApp, receiver);

app.post("/api/slack/events", async (req, res) => {
    try {
        const fetchReq = await toFetchRequest(req);
        const fetchRes = await slackHandler(fetchReq);
        await sendFetchResponse(res, fetchRes);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Local dev listener (ignored on Vercel)
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

module.exports = app;
