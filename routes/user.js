
const express = require('express');
const router = express.Router();
const UserController = require("../controllers/user");
const autorizacion = require("../middlewares/auth");
const multer = require("multer");

//Config de subida
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,"./uploads/avatars/");
    },
    filename: (req,file,cb) => {
        cb(null,"avatar-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba-usuario",autorizacion.auth, UserController.pruebaUser);
router.post("/register",UserController.register);
router.post("/login",UserController.login);
router.get("/profile/:id",autorizacion.auth, UserController.profile);
router.get("/list/:page?",autorizacion.auth, UserController.list);
router.put("/update",autorizacion.auth,UserController.update );
router.post("/upload",[autorizacion.auth,uploads.single("file0")],UserController.upload);
// Exportar router
module.exports = router;