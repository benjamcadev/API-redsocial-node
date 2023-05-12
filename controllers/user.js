// Importar dependencias y modulos
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// importar helpers
const followService = require("../helpers/followService");



//Acciones de prueba 
const pruebaUser = (req,res) => {
    return res.status(200).send(
        {
            message: "Mensaje enviado desde el controlador user.js",
            usuario: req.user
        }
    );
}

//****************METODOS****************

    //Registro de usuarios
    const register =  (req,res) => {
        // Recoger datos de la peticion
        let params = req.body;
        //Comprobar que me llegan bien y validarlos
        if(!params.name || !params.nick || !params.email || !params.password){
            console.log("VALIDACION INCORRECTA");
            
            return res.status(400).json(
                {
                    message: "Faltan datos por enviar",
                    status: "error"
                }
            )
        }
        
       


        //Control de usuarios duplicados
        User.find(  { $or: [
        {email: params.email.toLowerCase()},
        {nick: params.nick.toLowerCase()}
        ]})

       .then( async (users) =>  {

        if (!users) {
            return res.status(500).json(
                {
                    message: "Error en la consulta",
                    status: "error"
                }
            )
        }

        if (users && users.length >= 1) {
            return res.status(200).send({
                message: "El usuario ya existe",
                status: "success",
            })
        }


            // Cifrar la contraseña 
            let pwd = await bcrypt.hash(params.password, 10); // el 10 es cuantas veces cifra la contraseña
            params.password = pwd;

            // Crear objeto de usuario
            let user_to_save = new User(params);

             // Guardar usuario en la base de datos
        user_to_save.save().then(userStored => {
            if (!userStored) {
                console.log("error");
            }else{
                console.log("registrado");
                 // Devolver resultado
                return res.status(200).json(
                    {
                        message: "Registro de nuevo usuario",
                        status: "success",
                        user_to_save
                    }
                )
                
       
            }
        });

        });

    }


const login = (req,res) => {
    //Recoger parametros
    const params = req.body;

    if (!params.email || !params.password) {
        return res.status(404).send({
            status: "error",
            message: "faltan datos por enviar"
        })
    }

    //Buscar en la bd si existe   FinOne buscar un solo registro en mongo
    User.findOne({email: params.email})

    //.select({"password": 0}) //Con esto hago que la password no la retorne en la consulta

    .then((user) => {
        if (!user) {
            return res.status(404).send(
                {
                    status: "error",
                    message: "no existe usuario"
                });

        }

            //Comporbar su contrseña
           const pwd =  bcrypt.compareSync(params.password, user.password);

           if (!pwd) {
            return res.status(400).send(
                {
                    status: "error",
                    message: "No te has identificado correctamente"
                }
            )
           }
            //Generar Token
           const token = jwt.createToken(user);
          


            //Devolver Datos del usuario


            return res.status(200).send({
                status: "success",
                message: "Te has identificado correctamente",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            });
    }).catch((err) => {
        return res.status(404).send(
            {
                status: "error",
                message: "no existe usuario",
                err
            });
    })
    
}

const profile = (req,res) => {
    // Recibir parametros del id de usuario por la url
    const id = req.params.id;

    // Consulta para sacar los datos del usuario
     User.findById(id)
    .select({password: 0, role: 0}) //select y 0 es para no mostrar esos campos en la consulta
    .then(async (userProfile) => {
        if (!userProfile) {
            return res.status(404).send(
                {
                    status: "error",
                    message: "El usuario no existe o hay un error"
                }
            );    
        }

        // info de los follows
        const followInfo = await followService.followThisUser(req.user.id, id) // paso el id del usuario logeado y el id del usuario del perfil 
        // Devolver el resultado
        
        return res.status(200).send(
            {
                status: "success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            }
        );   
    })
 
}

const list = (req,res) => {

    //Controlar en que pagina estamos
    let page = 1; //pagina por defecto

    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);

    //Cosnulta con mongoose paginate
    let itemsPerPage = 5;

    User.find()
    .sort('_id')
    .paginate(page,itemsPerPage)
    .then(async (users) => {
     //Devolve rel resultado
    
      // Get total users
      const totalUsers = await User.countDocuments({}).exec();

       // sacar un array de los ids de los usuarios que me siguen y los que sigo 
       let followUserIds = await followService.followUserIds(req.user.id);

      if(!users)
      {
           return res.status(404).send
           ({
                status: "Error",
                message: "No users avaliable...",
                error: error
           });
      }

     // Return response
     return res.status(200).send
     ({
          status: 'Success',
          users,
          page,
          itemsPerPage,
          total: totalUsers,
          pages: Math.ceil(totalUsers/itemsPerPage),
          user_following: followUserIds.following,
          user_follow_me: followUserIds.followers
     });
        
    })
    .catch((error) =>
    {
         return res.status(500).send
         ({
              status: "Error",
              error: error,
              message: "Query error..."
              
         });
    }); 
}

const update = (req,res) => {
    // Recoger info del usuario a actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar campos sobrantes

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.image;
    delete userToUpdate.role;

    // Comprobar si el usuario ya existe
    //Control de usuarios duplicados
    User.find(  { $or: [
        {email: userToUpdate.email.toLowerCase()},
        {nick: userToUpdate.nick.toLowerCase()}
        ]})

       .then( async (users) =>  {

        if (!users) {
            return res.status(500).json(
                {
                    message: "Error en la consulta",
                    status: "error"
                }
            )
        }

        let userIsset = false;

        users.forEach(user => {
            if (user && user.id != userIdentity.id) {
                userIsset = true;
            }
        })

        if (userIsset) {
            return res.status(200).send({
                message: "El usuario ya existe",
                status: "success",
            })
        }


            // Cifrar la contraseña 
            if (userToUpdate.password) {
                let pwd = await bcrypt.hash(userToUpdate.password, 10); // el 10 es cuantas veces cifra la contraseña
                userToUpdate.password = pwd;
            }

             // si me llega la password cicfrarla

        // Buscar y actualizar
       let userUpdate = await User.findByIdAndUpdate(userIdentity.id,userToUpdate,{new:true}) // el new:true devuelve el objeto actualizado
        .then((userUpdate) => {

            if (!userUpdate) {
                return res.status(400).json(
                    {
                        message: "Error en la actualizacion",
                        status: "error"
                    }
                    )}
        })
        .catch((error) => {
            return res.status(500).json(
                {
                    message: "Error en el catch de actualizacion",
                    status: "error"
                    
                }
                )
        })

        
        return res.status(200).send
        ({
            status: 'Success',
            message: "Metodo de actualizar usuario",
            userToUpdate

        });
    });


   
}

const upload = (req,res) => {

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
    User.findOneAndUpdate({_id: req.user.id},{image: req.file.filename},{new: true})
    .then((userUpdated) => {

        return res.status(200).send
    ({
        status: 'success',
        user: userUpdated,
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

const avatar = (req,res) => {

    // Sacar parametros de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/avatars/"+file;

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

//Exportar acciones

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}