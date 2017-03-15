// app.js
"use strict";

const Path = require('path');
const Fs = require('fs');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const Koa = require('koa');

let app = new Koa();
let html = Fs.readFileSync(__dirname + '/views/index.html', 'utf-8');

// response
app.use(ctx => {
     ctx.response.body = html;
});

let server = app.listen(3000);
let wss = new WebSocketServer({
    server: server
});

let messages = []
wss.broadcast = function () {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messages.join('\n'));
    }
  });
};
wss.on('connection', function (ws) {
    console.log(`[SERVER] connection()`);
    if (messages.length > 0) {
        wss.broadcast();
    }
    ws.on('message', function (message) {
        console.log(`[SERVER] Received: ${message}`);
        if (message && message.trim()) {
            messages.push(message);
            wss.broadcast();
        }
    });
});
