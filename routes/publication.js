
const express = require('express');
const router = express.Router();
const PublicationController = require("../controllers/publication");
const autorizacion = require("../middlewares/auth");
const multer = require("multer");

//Config de subida
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,"./uploads/publications/");
    },
    filename: (req,file,cb) => {
        cb(null,"publication-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});



// Definir rutas
router.get("/prueba-publicacion",PublicationController.pruebaPublication);
router.post("/save", autorizacion.auth,PublicationController.save);
router.get("/detail/:id", autorizacion.auth, PublicationController.detail);
router.delete("/remove/:id",autorizacion.auth, PublicationController.remove);
router.get("/user/:id/:page?", autorizacion.auth, PublicationController.user);
router.post("/upload/:id", [autorizacion.auth, uploads.single("file0")], PublicationController.upload)
router.get("/media/:file",  PublicationController.media);
router.get("/feed/:page?",autorizacion.auth, PublicationController.feed);
// Exportar router
module.exports = router;