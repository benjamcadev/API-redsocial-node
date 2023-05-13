// importar modulos
const fs = require("fs");
const path = require("path");
// importar modelo
const Publication = require("../models/publication");

// importar servicios
const followService = require("../helpers/followService");
const publication = require("../models/publication");

//Acciones de prueba
const pruebaPublication = (req,res) => {
    return res.status(200).send(
        {
            message: "Mensaje enviado desde el controlador publication.js"
        }
    );
}

// Guardar publicacion
const save = (req,res) => {

    // Recoger los datos del body
    const params = req.body;

    // si no me llegan dar respuesta negativa
    if (!params.text) {
        return res.status(400).send({
            status: "error",
            message: "Debes enviar el texto de la publicacion"
        })
    }

    // crear y rellenar el objeto del modelo
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    // guardar el objeto en la bbdd
    newPublication.save()
    .then((publicationStored) => {

        return res.status(200).send({
            status: "success",
            message: "guardar publicacion",
            publicationStored
    
        });


    })
    .catch((error) => {
        return res.status(400).send({
            status: "error",
            message: "Hubo un error al guardar publicacion"
    
        });
    })
    
   
}

// Sacar una publicacion
const detail = (req,res) => {

    // sacar id de la publicacion de la url
    const publicationId = req.params.id;

    // Find con la condicion del id
    Publication.findById(publicationId)
    .then((publicationStored) => {

        console.log(publicationStored)

        if (!publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
        
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Mostrar publicacion",
            publication: publicationStored
        });
    })
    .catch((error) => {
        return res.status(400).send({
            status: "error",
            message: "Hubo un error al mostrar detalle de publicacion"
    
        });
    })



  

}

// Eliminar publicaciones

const remove = (req,res) => {

    // Sacar el id de la publicacion a eliminar
    const publicationId = req.params.id;

    // find y luego un remove
    Publication.find({"user": req.user.id, "_id": publicationId})
    .deleteOne()
    .then((removePublication) => {
        return res.status(200).send({
            status: "success",
            message: "Publicacion eliminada publicacion"
           
        });
    })
    .catch((error) => {
        return res.status(500).send(
            {
                status: "error",
               message: "Hubo un error al eliminar publicacion"
            }
        );
    })



}

// Listar todas las publicaciones



// Listar publicaciones de un usuario

const user = (req,res) => {
    // sacar el id del usuario
    const userId = req.params.id;
    // Contorlar la pagina
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    const itemsPerPage = 5;

    //Find, populate, ordenar, paginar
    Publication.find({
        "user": userId
    })
    .sort("-created_at")
    .populate("user", "-password -__v -role")
    .paginate(page, itemsPerPage)
    .then(async(publications) => {

        if (!publications) {
            return res.status(404).send(
                {
                    status: "error",
                   message: "No existen publicaciones para mostrar"
                }
            );
        }
        
         // Get total users
      const totalPublications = await Publication.countDocuments({}).exec();
           // devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Publicaciones del perfil de un usuario",
            user: req.user,
            page,
            totalPublications,
            pages: Math.ceil(totalPublications/itemsPerPage),
            publications
        
        });
    })
    .catch((error) => {
        return res.status(500).send(
            {
                status: "error",
               message: "Hubo un error al listar las publicaciones"
            }
        );
    })

 
}

// Subir ficheros
const upload = (req,res) => {
    // Sacar publicaction id
    const publicationId = req.params.id;

    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Peticion no incluye la imagen"
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // SDacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        // Si no es correcta, borrar archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath); //Borramos el archivo de forma async

        return res.status(400).send({
            status: "error",
            message: "Extension del fichero invalida"
        })
    }

    

    // Si es correcta, guardan imagen en la bd
    Publication.findOneAndUpdate({"user": req.user.id, "_id": publicationId},{file: req.file.filename},{new: true})
    .then((publicationUpdated) => {

        return res.status(200).send
    ({
        status: 'success',
        publication: publicationUpdated,
        file: req.file
       

    });

    })
    .catch((error) => {
        return res.status(500).send
        ({
            status: 'error',
            message: 'Error en la subida del avatar'
           
    
        });
    })
     
    
}

// Devolver archivos multimedias
const media = (req,res) => {

    // Sacar parametros de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/publications/"+file;

    // Comprobar que existe
    fs.stat(filePath, (error,exists) => {
        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "no existe la imagen"
            })
        }
       
        // Devolver un file
         return res.sendFile(path.resolve(filePath));
    })
    
}

const feed = async (req,res) => {
    // sacar la pagina actual
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }
    // establecer numero de elementos por pagina
    let itemsPerPage = 5;

    // sacar un array de identificadores de usuarios que yo sigo como usuario logueado
    try {
        const myFollows = await followService.followUserIds(req.user.id);

          // find a publicaciones con el operador $in, hace match con valores en array, odenar, popular y paginar

        Publication.find({
            user: {"$in": myFollows.following}
          })
          .then(async (publications) => {


            return res.status(200).send(
                {
                    status: "success",
                   message: "Feed de publicaciones",
                   myFollows: myFollows.following,
                   publications
                }
            );

          })
          
   


    } catch (error) {
        return res.status(500).send(
            {
                status: "error",
               message: "No se han listado las publicaciones"
            }
        );
    }
    


  
}

//Exportar acciones

module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}