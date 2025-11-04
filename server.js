// server.js
// Este archivo monta un servidor Express simple que sirve:
// - archivos estáticos (frontend)
// - rutas de autenticación (con Supabase)
// - rutas protegidas de ejemplo y un CRUD en memoria para demostración
// Comentarios: Este es un proyecto de ejemplo. En un proyecto real las
// credenciales y la lógica de persistencia deberían vivir en servicios
// separados y las claves nunca deben estar en el repositorio.

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Configuración básica
app.use(cors());
app.use(express.json());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'src/public')));
app.use('/js', express.static(path.join(__dirname, 'src/js')));
app.use('/css', express.static(path.join(__dirname, 'src/css')));

// Ruta raíz - redirige a login.html
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Importar las rutas de autenticación
const { router: authRouter, verifyToken } = require('./src/routes/auth');

// Middleware para debuggear rutas
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Usar las rutas de autenticación
app.use('/api/auth', authRouter);

// Rutas protegidas de ejemplo
app.get('/api/data', verifyToken, (req, res) => {
    const userData = {
        message: 'API funcionando correctamente',
        user: {
            ...req.user,
            lastLogin: new Date().toLocaleString()
        }
    };
    
    res.json(userData);
});

// In-memory items store for CRUD demo
app.locals.items = [
    { id: 1, nombre: 'Ejemplo 1', descripcion: 'Descripción 1' },
    { id: 2, nombre: 'Ejemplo 2', descripcion: 'Descripción 2' }
];

// CRUD: GET all
app.get('/api/items', verifyToken, (req, res) => {
    res.json(app.locals.items);
});

// CRUD: Create
app.post('/api/items', verifyToken, (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'nombre es requerido' });
    const items = app.locals.items;
    const id = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const nuevo = { id, nombre, descripcion: descripcion || '' };
    items.push(nuevo);
    res.status(201).json(nuevo);
});

// CRUD: Update
app.put('/api/items/:id', verifyToken, (req, res) => {
    const id = Number(req.params.id);
    const { nombre, descripcion } = req.body;
    const items = app.locals.items;
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Item no encontrado' });
    items[idx] = { ...items[idx], nombre: nombre ?? items[idx].nombre, descripcion: descripcion ?? items[idx].descripcion };
    res.json(items[idx]);
});

// CRUD: Delete
app.delete('/api/items/:id', verifyToken, (req, res) => {
    const id = Number(req.params.id);
    const items = app.locals.items;
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Item no encontrado' });
    const removed = items.splice(idx, 1)[0];
    res.json(removed);
    });
// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});