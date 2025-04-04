const { Pedido } = require('../models');
exports.obtenerPedidos = async (req, res) => {
    const pedidos = await Pedido.findAll();
    res.json(pedidos);
};
exports.crearPedido = async (req, res) => {
    const pedido = await Pedido.create(req.body);
    res.status(201).json(pedido);
};
exports.obtenerPedidoPorID = (req, res) => {
    const { id } = req.params; // Obtener el ID del pedido
    Pedido.findByPk(id)
        .then(pedido => {
            if (!pedido) {
                return res.status(404).json({ error: "Pedido no encontrado" });
            }
            res.json(pedido);
        })
        .catch(error => {
            console.error("Error al obtener el pedido:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        });
};
exports.actualizarPedido = (req, res) => {
    const { id } = req.params;
    const { fecha, total } = req.body;
    Pedido.findByPk(id)
        .then(pedido => {
            if (!pedido) {
                return res.status(404).json({ error: "Pedido no encontrado" });
            }
            pedido.update({ fecha, total })
                .then(updatedPedido => {
                    res.json(updatedPedido);
                })
                .catch(error => {
                    console.error("Error al actualizar el pedido:", error);
                    res.status(500).json({ error: "Error interno del servidor" });
                });
        })
        .catch(error => {
            console.error("Error al buscar el pedido:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        });
};
exports.eliminarPedido = (req, res) => {
    const { id } = req.params; // Obtener el ID del pedido
    Pedido.findByPk(id)
        .then(pedido => {
            if (!pedido) {
                return res.status(404).json({ error: "Pedido no encontrado" });
            }
            pedido.destroy()
                .then(() => {
                    res.json({ message: "Pedido eliminado correctamente" });
                })
                .catch(error => {
                    console.error("Error al eliminar el pedido:", error);
                    res.status(500).json({ error: "Error interno del servidor" });
                });
        })
        .catch(error => {
            console.error("Error al buscar el pedido:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        });
};
