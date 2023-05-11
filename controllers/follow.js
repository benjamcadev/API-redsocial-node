// importar modelo
const Follow = require("../models/follow");
const User = require("../models/user");
const mongoosePaginate = require("mongoose-pagination");


//Acciones de prueba
const pruebaFollow = (req,res) => {
    return res.status(200).send(
        {
            message: "Mensaje enviado desde el controlador follow.js"
        }
    );
}

//Funcion de guardar un follow o seguir
const save = (req,res) => {

    // conseguir los datos por body
    const params = req.body;

    // sacar id del usuario identificado

    const identity = req.user;
    // crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });
   

    // guardar objeto en bbdd
    userToFollow.save()
    .then((followStored) => {

        if (!followStored) {
            return res.status(500).send(
                {
                    status: "error",
                    message: "No se ha podido seguir al usuario"
                }
            );
        }

        return res.status(200).send(
            {
                status: "success",
                identity,
                follow: followStored
            }
        );
    })

   
}

// Funcion de borrar un follow o dejar de seguir
const unfollow = (req,res) => {
    // Recoger el id del usuario identificado
    const userId = req.user.id;

    // Recoger el id del usuario que sigo y quiero dejar de seguit
    const followedId = req.params.id;

    // find de las coincidencias y hace remove
    Follow.find({
        "user": userId,
        "followed": followedId
    })
    .deleteOne()
    .then((followDeleted) => {
        return res.status(200).send(
            {
                status: "success",
                message: "Follow eliminado correctamente"
                
            }
        );
    })
    .catch((error) => {
        return res.status(500).send(
            {
                status: "error",
               message: "Hubo un error al dejar de seguir"
            }
        );
    })


    
}

// Funcion de listar usuarios que cualquier usuario esta siguiendo (siguiendo)
const following = (req,res) => {
    // sacar el id del usuario identificado
    let userId = req.user.id;

    // comprobar si me llega el id por parametro en url
    if (req.params.id) {
        userId = req.params.id;
    }
    /// comprobar si me llega la pagina, si no la pagina 1
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    // usuarios por pagina quiero mostrar
    const itemsPerPage = 5;
    // find a follow, popular datos de los usuario y paginar con mongoose paginate
    Follow.find({
        user: userId
    })
    .populate("user followed","-password -role -__v") // Con esto le indico que me traiga los campos de la coleccion de donde viene esa id, una espeecie de inner join con las fk, con el "-" quito campos o puedo escribir los que quiero que aparecan
    .paginate(page, itemsPerPage)
    .then(async (follows) => {

         // Get total users
      const totalFollows = await Follow.countDocuments({}).exec();
        // listado de usuarios de
    // sacar un array de los ids de los usuarios que me siguen y los que sigo 

    return res.status(200).send(
        {
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows,
            totalFollows,
            pages: Math.ceil(totalFollows/itemsPerPage)
            
        }
    );
    })
    .catch((error) => {
        return res.status(500).send(
            {
                status: "error",
                message: "Hubo un error al listar los seguidores"
                
            }
        );
    })
    
}

// Funcion que me lista los usuarios que siuen a cualquier otro usuario (seguidores)
const followers = (req,res) => {

    return res.status(200).send(
        {
            status: "success",
            message: "Listado de usuarios que me siguen"
            
        }
    );
}

//Exportar acciones

module.exports = {
    pruebaFollow,
    save,
    unfollow,
    followers,
    following

}