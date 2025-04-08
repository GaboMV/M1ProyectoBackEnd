const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = 'mi_secreto_aqui';

// Registro de usuario
exports.register =    async (req, res) => {
    // Revisa si las validaciones fallaron
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Devuelve los errores si hay alguno
    }

    const { name, email, password } = req.body;

    try {
        // Verifica si el correo ya está registrado
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Si no existe el correo, se crea el nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}


// Login de usuario
exports.login = async (req, res) => {
    // Verificar si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getLoggedUser = async (req, res) => {
    try {
        const user = req.user; // El usuario completo ya está disponible en req.user

        res.json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};