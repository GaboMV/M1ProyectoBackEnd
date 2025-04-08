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
        const task = await Task.create({
            title,
            description,
            dueDate,
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
        if (!task) return res.status(404).json({ error: 'Task not found' });
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
        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (task.status === 'completada') return res.status(400).json({ error: 'Task is completed and cannot be modified' });

        const { title, description, status, dueDate } = req.body;
        if (status === 'en progreso' && task.status === 'en progreso') await task.update({ title, description, status, dueDate });
        if (status === 'pendiente' && task.status =='en progreso') return res.status(400).json({ error: 'Cannot revert to pendiente' });
        if(status === 'pendiente' && task.status ==='pendiente')  await task.update({ title, description, status, dueDate });
        if(status === 'completada' && task.status ==='pendiente')  return res.status(400).json({ error: 'Can only move to completada from en progreso' });

        await task.update({ title, description, status, dueDate });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.completeTask = async (req, res) => {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status !== 'en progreso') return res.status(400).json({ error: 'Only tasks in progress can be completed' });
    task.status = 'completada';
    await task.save();
    res.json(task);
};

exports.deleteTask = async (req, res) => {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status !== 'completada') return res.status(400).json({ error: 'Only completed tasks can be deleted' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
};
exports.getTasksByDate = async (req, res) => {
    try {
        const { dueDate } = req.params; // Recibe la fecha desde los parámetros de la ruta (formato ISO)

        // Verifica si la fecha es válida
        if (isNaN(Date.parse(dueDate))) {
            return res.status(400).json({ error: 'Fecha no válida' });
        }

        // Busca las tareas cuya fecha de vencimiento coincida con la fecha proporcionada
        const tasks = await Task.findAll({
            where: {
                userId: req.user.id,
                dueDate: {
                    [Op.eq]: new Date(dueDate) // Filtra tareas con la fecha exacta
                }
            }
        });

        if (tasks.length === 0) {
            return res.status(404).json({ error: 'No tasks found for the given date' });
        }

        res.json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};