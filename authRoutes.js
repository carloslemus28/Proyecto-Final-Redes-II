const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
  
require('dotenv').config();

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    const { nombre, apellido, correo, contrasena } = req.body;

    if (!nombre || !apellido || !correo || !contrasena) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el usuario existe
        const [usuarioExistente] = await db.promise().query(
            'SELECT * FROM usuarios WHERE correo = ?', [correo]
        );
        
        if (usuarioExistente.length > 0) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        // Encriptar la contra
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Insertar usuario en la base de datos
        await db.promise().query(
            'INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (?, ?, ?, ?)',
            [nombre, apellido, correo, hashedPassword]
        );

        res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

// Inicio de sesion
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    try {
        // Buscar usuario en la base de datos
        const [usuario] = await db.promise().query(
            'SELECT * FROM usuarios WHERE correo = ?', [correo]
        );

        if (usuario.length === 0) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        // Verificar la contra
        const validPassword = await bcrypt.compare(contrasena, usuario[0].contrasena);
        if (!validPassword) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }
        // Generar token
        const token = jwt.sign({ id: usuario[0].id, correo: usuario[0].correo }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.status(200).json({ mensaje: 'Inicio de sesión exitoso', token, usuario: usuario[0] });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});
//Restablecer contra
router.post('/restablecer', async (req, res) => {
  const { correo, nuevaContrasena } = req.body;

  const user = await prisma.usuario.findUnique({ where: { correo } });
  if (!user) return res.status(404).json({ mensaje: "Correo no registrado" });

  const hash = await bcrypt.hash(nuevaContrasena, 10);
  await prisma.usuario.update({
    where: { correo },
    data: { contrasena: hash }
  });

  res.json({ mensaje: "Contraseña actualizada exitosamente" });
});

module.exports = router;
