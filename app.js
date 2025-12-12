const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'menu.html'));
});

app.get('/inventario', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'inventario.html'));
});

app.get('/inventario/registrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registrar.html'));
});

app.get('/inventario/editar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'editar.html'));
});

app.get('/ventas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'ventas.html'));
});

app.get('/administrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'administrar.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
