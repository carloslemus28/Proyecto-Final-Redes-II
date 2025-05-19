const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
    const token = req.headers['authorization'];


    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const tokenLimpio = token.replace('Bearer ', '');

        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);

        req.usuario = verificado;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
    }
}

module.exports = verificarToken;
