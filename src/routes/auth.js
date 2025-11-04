// src/routes/auth.js
// Rutas de autenticación usadas por el servidor. Este archivo muestra
// cómo delegar la autenticación a Supabase desde el backend.
// Exporta: { router, verifyToken } donde `router` contiene endpoints
// POST /login y POST /register y `verifyToken` es un middleware para
// proteger rutas.

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Ruta de login
router.post('/login', async (req, res) => {
    console.log('Recibida petición de login:', req.body);
    try {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email y contraseña son requeridos' 
            });
        }

        // Intentar login con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ 
                message: error.message 
            });
        }

        // Login exitoso
        res.json(data);

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor' 
        });
    }
});

// Ruta de registro (opcional)
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email y contraseña son requeridos' 
            });
        }

        // Intentar registro con Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({ 
                message: error.message 
            });
        }

        // Registro exitoso
        res.json(data);

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor' 
        });
    }
});

// Middleware para verificar token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Token no proporcionado' 
            });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            return res.status(401).json({ 
                message: 'Token inválido' 
            });
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ 
            message: 'Error en autenticación' 
        });
    }
};

module.exports = { router, verifyToken };