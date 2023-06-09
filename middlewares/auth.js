
// ##### ESTO ES UN MIDDLEWARE, QUIERE DECIR QUE ESTE CODIGO SE EJECUTA ANTES DE LAS RUTAS Y LOS CONTROLADORES ######

//importar dependencias o modulos
const jwt = require("jwt-simple");
const moment = require("moment");

//importar clave secreta
const libjwt = require("../helpers/jwt");
const secret = libjwt.secret;

//ES UN MIDDLEWARE de auth
const auth = (req,res,next) => {
// comporobar si llega la cabecera de auth
if (!req.headers.authorization) {
    return res.status(403).send({
        status: "error",
        message: "La peticion no tiene la cabecera de autenticacion"
    });
    
}

// limpiar el token
let token = req.headers.authorization.replace(/['"]+/g,'');

// decodificar el token
try {
    let payload = jwt.decode(token, secret);
    

    // comprobar expiracion del token
    if (payload.exp <= moment().unix()) {
        return res.status(401).send({
            status: "error",
            message: "Token expirado"
            
        })
        
    }
    // agregar datos de usuario a la request
    req.user = payload;



} catch (error) {
    return res.status(404).send({
        status: "error",
        message: "Token invalido",
        error
    })
}
 


   
    // pasar a ejcucion de accion
    next();
}

module.exports = {
    auth
}