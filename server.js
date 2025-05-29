require('dotenv').config();
//Importaciones
const express = require('express');
const cors = require('cors');
const authRoutes = require('./authRoutes');
const db = require('./db');
const gameRoutes = require('./gameRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de la ruleta funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

