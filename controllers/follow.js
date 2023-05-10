// importar modelo
const Follow = require("../models/follow");
const User = require("../models/user");


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


// Funcion de listar usuarios que sigo

// Funcion que me lista los usuarios que me siguen

//Exportar acciones

module.exports = {
    pruebaFollow,
    save
}