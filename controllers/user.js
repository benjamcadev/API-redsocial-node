// Importar dependencias y modulos
const User = require("../models/user");
const bcrypt = require("bcrypt");

//Acciones de prueba 
const pruebaUser = (req,res) => {
    return res.status(200).send(
        {
            message: "Mensaje enviado desde el controlador user.js"
        }
    );
}

//****************METODOS****************

    //Registro de usuarios
    const register = async (req,res) => {
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
       ]}).then(  (users) =>  {

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
       })

        // Cifrar la contraseña 
       let pwd = await bcrypt.hash(params.password, 10); // el 10 es cuantas veces cifra la contraseña
       params.password = pwd;

        // Crear objeto de usuario
        let user_to_save = new User(params);
       
        // Guardar usuario en la base de datos
        user_to_save.save().then((userStored) => {
            if (!userStored) {
                console.log("error");
            }else{
                console.log("registrado");
            }
        });
      

        // Devolver resultado


        return res.status(200).json(
            {
                message: "Registro de nuevo usuario",
                status: "success",
                user_to_save
            }
        )
    }

//Exportar acciones

module.exports = {
    pruebaUser,
    register
}