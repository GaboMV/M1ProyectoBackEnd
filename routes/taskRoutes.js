const express = require('express');
const { body, query } = require('express-validator');

const auth = require('../middleware/authMiddleware');
const { createTask, getTasks, updateTask, completeTask, deleteTask, getTaskById, searchTasks, getTasksByStatus,
    getTasksByDate
} = require('../controllers/task.controller');
const router = express.Router();

router.use(auth);

router.post('/',[
    // Validaciones con express-validator
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('description').notEmpty().withMessage('La descripción es obligatoria'),
    body('dueDate').isISO8601().withMessage('La fecha de vencimiento debe ser una fecha válida') .custom(value => {
        if (new Date(value) < new Date()) { // Compara la fecha ingresada con la fecha actual
            throw new Error('La fecha de vencimiento no puede ser una fecha pasada');
        }
        return true;
    })], createTask);
router.get('/', getTasks);
router.put('/:id',[
    // Validaciones
    body('title').optional().notEmpty().withMessage('El título no puede estar vacío'),
    body('description').optional().notEmpty().withMessage('La descripción no puede estar vacía'),
    body('dueDate').optional().isISO8601().withMessage('La fecha de vencimiento debe ser una fecha válida')], updateTask);
router.patch('/:id/complete', completeTask);
router.get('/dueDate/:dueDate', getTasksByDate);
router.delete('/:id', deleteTask);
router.get('/:id', getTaskById);
router.get('/status/:status', getTasksByStatus);
router.get('/search/:keyword', searchTasks);
module.exports = router;