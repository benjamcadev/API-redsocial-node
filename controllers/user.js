
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
    const register = (req,res) => {
        // Recoger datos de la peticion

        //Comprobar que me llegan bien y validarlos

        //Control de usuarios duplicados

        // Cifrar la contraseña

        // Guardar usuario en la base de datos

        // Devolver resultado


        return res.status(200).json(
            {
                message: "Registro de nuevo usuario"
            }
        )
    }

//Exportar acciones

module.exports = {
    pruebaUser,
    register
}