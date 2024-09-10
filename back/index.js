// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// app.use(cors({
//     origin: 'http://localhost:5173',  // Replace with your frontend origin
//     methods: ['GET', 'POST'],         // Allow specific methods
//     credentials: true,                // If you need credentials (like cookies, auth headers)
// }));

// app.use(express.json());

// let currentCode = generateUniqueCode();

// // Function to generate a random 4-digit code
// function generateUniqueCode() {
//     return Math.floor(1000 + Math.random() * 9000);
// }

// // Schedule to generate a new code every 5 minutes (300000 ms)
// setInterval(() => {
//     currentCode = generateUniqueCode();
//     broadcastCode(currentCode);
// }, 300000); // 5 minutes in milliseconds

// // Broadcast the code to all connected WebSocket clients
// function broadcastCode(code) {
//     wss.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify({ code }));
//         }
//     });
// }

// // API for the admin to inject a custom code
// app.post('/inject-code', (req, res) => {
//     const { code } = req.body;
//     if (code && code.length === 4 && /^\d{4}$/.test(code)) {
//         currentCode = code;
//         broadcastCode(currentCode);
//         return res.status(200).send({ message: 'Code injected successfully.' });
//     } else {
//         return res.status(400).send({ message: 'Invalid code. Please provide a 4-digit numeric code.' });
//     }
// });

// // Serve the WebSocket connection
// wss.on('connection', ws => {
//     // Send the current code when a new client connects
//     ws.send(JSON.stringify({ code: currentCode }));
// });

// server.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });


const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
    origin: 'http://localhost:5173',  // Frontend origin
}));
app.use(express.json());

// Middleware to check for admin token
function adminMiddleware(req, res, next) {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken === 'your-admin-secret-token') {
        next();
    } else {
        return res.status(403).send({ message: 'Forbidden: Unauthorized' });
    }
}

let currentCode = generateUniqueCode();

function generateUniqueCode() {
    return Math.floor(1000 + Math.random() * 9000);
}

setInterval(() => {
    currentCode = generateUniqueCode();
    broadcastCode(currentCode);
}, 100000);

function broadcastCode(code) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ code }));
        }
    });
}

// Inject code route (protected by admin middleware)
app.post('/inject-code', adminMiddleware, (req, res) => {
    const { code } = req.body;
    if (code && code.length === 4 && /^\d{4}$/.test(code)) {
        currentCode = code;
        broadcastCode(currentCode);
        return res.status(200).send({ message: 'Code injected successfully.' });
    } else {
        return res.status(400).send({ message: 'Invalid code. Please provide a 4-digit numeric code.' });
    }
});

wss.on('connection', ws => {
    ws.send(JSON.stringify({ code: currentCode }));
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
