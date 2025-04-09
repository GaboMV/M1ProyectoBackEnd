const { validationResult } = require('express-validator');
const { Task } = require('../models');
const { Op } = require('sequelize');

exports.createTask = async (req, res) => {
    // Comprobar si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, dueDate } = req.body;

        // Ajuste para la fecha
        let adjustedDueDate = dueDate;
        if (dueDate) {
            // Crear fecha en UTC para evitar problemas de zona horaria
            const date = new Date(dueDate);

            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
                return res.status(400).json({ error: 'Fecha no válida' });
            }

            // Ajustar a UTC (elimina el desfase de zona horaria)
            adjustedDueDate = new Date(Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            ));
        }

        const task = await Task.create({
            title,
            description,
            dueDate: adjustedDueDate,
            userId: req.user.id
        });

        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.getTasks = async (req, res) => {
    const { status, dueDate } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (dueDate) where.dueDate = dueDate;

    const tasks = await Task.findAll({ where });
    res.json(tasks);
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getTasksByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const tasks = await Task.findAll({
            where: {
                userId: req.user.id,
                status
            }
        });
        res.json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.searchTasks = async (req, res) => {
    try {
        const { keyword } = req.params;
        const tasks = await Task.findAll({
            where: {
                userId: req.user.id,
                [Op.or]: [
                    { title: { [Op.iLike]: `%${keyword}%` } },
                    { description: { [Op.iLike]: `%${keyword}%` } }
                ]
            }
        });
        res.json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.updateTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
        if (task.status === 'completada') return res.status(402).json({ error: 'Las tareas completadas no pueden editarse' });

        const { title, description, status, dueDate } = req.body;
        if (status === 'en progreso' && task.status === 'en progreso') await task.update({ title, description, status, dueDate });
        if (status === 'pendiente' && task.status =='en progreso') return res.status(402).json({ error: 'No se puede revrtir a pendiente' });
        if(status === 'pendiente' && task.status ==='pendiente')  await task.update({ title, description, status, dueDate });
        if(status === 'completada' && task.status ==='pendiente')  return res.status(402).json({ error: 'Solo puede ser completada si estuvo en progreso' });

        await task.update({ title, description, status, dueDate });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.completeTask = async (req, res) => {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status !== 'en progreso') return res.status(400).json({ error: 'Solo tareas en progreso pueden ser completadas' });
    task.status = 'completada';
    await task.save();
    res.json(task);
};

exports.deleteTask = async (req, res) => {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status !== 'completada') return res.status(402).json({ error: 'Solo tareas completadas pueden ser eliminadas' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
};
exports.getTasksByDate = async (req, res) => {
    try {
        const { dueDate } = req.params;

        // Verifica si la fecha es válida
        if (isNaN(Date.parse(dueDate))) {
            return res.status(400).json({ error: 'Fecha no válida' });
        }

        const date = new Date(dueDate);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        // Busca las tareas entre el inicio y fin del día
        const tasks = await Task.findAll({
            where: {
                userId: req.user.id,
                dueDate: {
                    [Op.gte]: date, // Mayor o igual que el inicio del día
                    [Op.lt]: nextDay // Menor que el inicio del día siguiente
                }
            }
        });

        if (tasks.length === 0) {
            return res.status(404).json({ error: 'No hay tareas para la fecha escogida' });
        }

        res.json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};