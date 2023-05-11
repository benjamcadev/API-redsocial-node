
const express = require('express');
const router = express.Router();
const FollowController = require("../controllers/follow");
const autorizacion = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-follow",FollowController.pruebaFollow);
router.post("/save",autorizacion.auth,FollowController.save);
router.delete("/unfollow/:id",autorizacion.auth,FollowController.unfollow);
router.get("/following/:id?/:page?",autorizacion.auth,FollowController.following);
router.get("/followers/:id?/:page?",autorizacion.auth,FollowController.followers);

// Exportar router
module.exports = router;