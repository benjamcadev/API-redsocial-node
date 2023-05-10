
const express = require('express');
const router = express.Router();
const FollowController = require("../controllers/follow");
const autorizacion = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-follow",FollowController.pruebaFollow);
router.post("/save",autorizacion.auth,FollowController.save)

// Exportar router
module.exports = router;