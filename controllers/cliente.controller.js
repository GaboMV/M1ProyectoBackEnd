const { Cliente } = require('../models');
exports.obtenerClientes = async (req, res) => {
    const clientes = await Cliente.findAll();
    res.json(clientes);
};
exports.crearCliente = async (req, res) => {
    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
};
exports.obtenerClientesPorID = async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.id);
    cliente ? res.json(cliente) : res.status(404).json({error: "Cliente no encontrado"});
};
exports.actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del cliente
        const { nombre, correo } = req.body; // Obtener los nuevos valores del cliente
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        await cliente.update({ nombre, correo });
        res.json(cliente);
    } catch (error) {
        console.error("Error al actualizar el cliente:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del cliente
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        await cliente.destroy();
        res.json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar el cliente:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
