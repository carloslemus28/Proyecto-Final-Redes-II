require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./authRoutes'); // Importamos las rutas de autenticación
const db = require('./db');
const gameRoutes = require('./gameRoutes'); // Importamos las rutas del juego

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes); //Prefijo para rutas del juego
// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de la ruleta funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

