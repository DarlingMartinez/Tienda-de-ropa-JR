const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
