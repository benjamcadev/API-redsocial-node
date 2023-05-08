// Importar dependencias y modulos
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../helpers/jwt");
const mongoosePagination = require("mongoose-pagination");


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
    .then((userProfile) => {
        if (!userProfile) {
            return res.status(404).send(
                {
                    status: "error",
                    message: "El usuario no existe o hay un error"
                }
            );    
        }
        // Devolver el resultado
        return res.status(200).send(
            {
                status: "success",
                user: userProfile
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
          pages: Math.ceil(totalUsers/itemsPerPage)
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
    const userToUpdate = req.user;

    // Eliminar campos sobrantes

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.image;
    delete userToUpdate.role;

    // Comprobar si el usuario ya existe
    User.find

    // si me llega la password cicfrarla

    // Buscar y actualizar

    
      return res.status(200).send
      ({
           status: 'Success',
           message: "Metodo de actualizar usuario"

      });
}

//Exportar acciones

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update
}