const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const { register, login, getLoggedUser  } = require('../controllers/user.controller');
const router = express.Router();

router.post('/register', [
    body('email')
        .isEmail().withMessage('El correo electrónico no es válido') // Valida que sea un correo válido
        .normalizeEmail(), // Normaliza el correo
    body('password')
        .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'), // Valida que la contraseña tenga al menos 4 caracteres
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
], register);
router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], login);
router.get('/me', auth, getLoggedUser);

module.exports = router;