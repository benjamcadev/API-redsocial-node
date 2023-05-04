
const express = require('express');
const router = express.Router();
const PublicationController = require("../controllers/publication");

// Definir rutas
router.get("/prueba-publicacion",PublicationController.pruebaPublication);

// Exportar router
module.exports = router;