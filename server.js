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

// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});