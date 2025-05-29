const express = require('express');
const db = require('./db');
const router = express.Router();
const verificarToken = require('./middlewares/verificarToken');
// Funcion para girar la ruleta y obtener el número ganador
function girarRuleta() {
    const numeroGanador = Math.floor(Math.random() * 37); // 0 a 36
    
    let colorGanador;
    if (numeroGanador === 0) {
        colorGanador = 'verde';
    } else if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(numeroGanador)) {
        colorGanador = 'rojo';
    } else {
        colorGanador = 'negro';
    }    

    return { numeroGanador, colorGanador };
}

// Ruta para  ruleta
router.get('/girar', (req, res) => {
    const resultado = girarRuleta();
    res.json(resultado);
});

// Ruta para apostar
router.post('/apostar', verificarToken,async (req, res) => {
    const { usuario_id, tipo_apuesta, valor_apostado, monto_apostado } = req.body;

    if (!usuario_id || !tipo_apuesta || !valor_apostado || !monto_apostado) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar limite de apuestas
        const [apuestasRealizadas] = await db.promise().query(
            'SELECT COUNT(*) AS total FROM historial_apuestas WHERE usuario_id = ?',
            [usuario_id]
        );

        if (apuestasRealizadas[0].total >= 5) {
            return res.status(403).json({ mensaje: 'Has alcanzado el límite de 5 jugadas.' });
        }

        // Verificar saldo del usuario
        const [usuario] = await db.promise().query(
            'SELECT coins FROM usuarios WHERE id = ?', [usuario_id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        if (usuario[0].coins < monto_apostado) {
            return res.status(400).json({ mensaje: 'Saldo insuficiente' });
        }

        // Girar la ruleta
        const { numeroGanador, colorGanador } = girarRuleta();
        let resultado = 'perdido';
        let coins_ganados = 0;

        // Verificar resultado
        if (tipo_apuesta === 'color' && valor_apostado === colorGanador) {
            coins_ganados = monto_apostado * (colorGanador === 'verde' ? 10 : 2);
            resultado = 'ganado';
        } else if (tipo_apuesta === 'numero' && parseInt(valor_apostado) === numeroGanador) {
            coins_ganados = monto_apostado * 5;
            resultado = 'ganado';
        }

        // Actualizar saldo
        const nuevoSaldo = (usuario[0].coins - monto_apostado) + coins_ganados;
        await db.promise().query(
            'UPDATE usuarios SET coins = ? WHERE id = ?',
            [nuevoSaldo, usuario_id]
        );

        // Registrar apuesta en historial
        await db.promise().query(
            'INSERT INTO historial_apuestas (usuario_id, tipo_apuesta, valor_apostado, monto_apostado, resultado, coins_ganados, numero_ganador, color_ganador) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, tipo_apuesta, valor_apostado, monto_apostado, resultado, coins_ganados, numeroGanador, colorGanador]
        );

        res.json({
            mensaje: resultado === 'ganado' ? '¡Felicidades, ganaste!' : 'Lo siento, perdiste.',
            numeroGanador,
            colorGanador,
            coins_ganados,
            nuevoSaldo
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
});

//Obtener historial de apuestas del usuario
router.get('/historial/:usuario_id', verificarToken, async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const [historial] = await db.promise().query(
            'SELECT tipo_apuesta, valor_apostado, monto_apostado, resultado, coins_ganados, numero_ganador, color_ganador, fecha FROM historial_apuestas WHERE usuario_id = ? ORDER BY fecha DESC',
            [usuario_id]
        );

        res.json({ historial });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el historial', error: error.message });
    }
});

// Obtener el ranking
router.get('/ranking', verificarToken, async (req, res) => {
    try {
        const [ranking] = await db.promise().query(
            'SELECT id, nombre, apellido, coins FROM usuarios ORDER BY coins DESC LIMIT 5'
        );
        res.json({ ranking });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el ranking', error: error.message });
    }
});

module.exports = router;
