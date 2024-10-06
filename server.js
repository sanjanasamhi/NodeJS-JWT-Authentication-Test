const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt: jwtMW } = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

const PORT = 3001;
const secretKey = 'My super secret key';
const jwtMiddleware = jwtMW({ secret: secretKey, algorithms: ['HS256'] });

let users = [
    { id: 1, username: 'sanju', password: '123' },
    { id: 2, username: 'reddy', password: '456' }
];

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        const token = jwt.sign({ id: user.id, username }, secretKey, { expiresIn: '3m' }); // Token expires in 3 minutes
        res.json({ success: true, err: null, token });
    } else {
        res.status(401).json({ success: false, token: null, err: 'Username or password is incorrect' });
    }
});

// Protected dashboard route
app.get('/api/dashboard', jwtMiddleware, (req, res) => {
    res.json({ success: true, myContent: 'Secret content that only logged-in people can see!' });
});

// Protected settings route
app.get('/api/settings', jwtMiddleware, (req, res) => {
    res.json({ success: true, settingsContent: 'This is the protected settings content.' });
});

// Serve static files like index.html and other frontend resources
app.use(express.static(path.join(__dirname)));

// Catch-all route to serve index.html for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling for unauthorized access
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ success: false, err: 'Invalid or expired token.' });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
