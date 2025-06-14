require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rutas públicas (sin autenticación)
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Rutas protegidas
const tareasRouter = require('./routes/tareas');
const materiasRouter = require('./routes/materias');
app.use('/api/tareas', authenticateToken, tareasRouter);
app.use('/api/materias', authenticateToken, materiasRouter);

// Ruta para verificar autenticación
app.get('/api/verify-auth', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    detalles: err.message
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});