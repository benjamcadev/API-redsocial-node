
const express = require('express');
const router = express.Router();
const UserController = require("../controllers/user");
const autorizacion = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-usuario",autorizacion.auth, UserController.pruebaUser);
router.post("/register",UserController.register);
router.post("/login",UserController.login);
router.get("/profile/:id",autorizacion.auth, UserController.profile);
router.get("/list/:page?",autorizacion.auth, UserController.list);
router.put("/update",autorizacion.auth,UserController.update );
// Exportar router
module.exports = router;