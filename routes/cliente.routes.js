const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente, obtenerClientesPorID, actualizarCliente, eliminarCliente} = require('../controllers/cliente.controller');
router.get('/clientes', obtenerClientes);
router.post('/clientes', crearCliente);
router.get("/clientes/:id", obtenerClientesPorID);
router.put("/clientes/:id", actualizarCliente);
router.delete("/clientes/:id", eliminarCliente);
module.exports = router;

