
//importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

//Clave secreta
const secret = "CLAVE_SECRETA_del_proyecto_DE_LA_RED_soCIAL_987987";

//Crear una funcion para generar token  

// AL CREAR UN TOKEN TODA ESTA INFO SE CODIFICA EN UN HASH Y DESPUES SE PUEDE ACCEDER A ELLA
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(), //fecha creacion del token
        exp: moment().add(30,"days").unix()

    };

    //DEvolver jwt token codificado
    return jwt.encode(payload,secret);
}



module.exports = {
    createToken,
    secret
}
