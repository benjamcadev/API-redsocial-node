// importar dependencias

const {connection} = require("./database/connection");
const express = require("express");
const cors = require("cors");

//mensaje de bienvenida
console.log("API NODE ARRANCADA");

//Conexion a la base de datos
connection();

//Crear servidor node
const app = express();
const puerto = 3900;


// Configurar cors ** Es un middleware, un middleware se ejecuta antes de los endpoint de la api
app.use(cors());


//Convertir los datos del body a objetos js
app.use(express.json()); //middleware que codifica los datos del body a objeto js
app.use(express.urlencoded({extended:true})) //decodificar los datos que llegen en urlencoded y los convierta en objeto js

//Cargar conf rutas

const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user",UserRoutes);
app.use("/api/publication",PublicationRoutes);
app.use("/api/follow",FollowRoutes);


//ruta de prueba
// app.get("/ruta-prueba",(req,res) => {
//     return res.status(200).json(
//         {
//             "id": 1,
//             "nombre": "benja"

//     })
// })

//Poner servidor a escuchar peticiones
app.listen(puerto,() =>{
    console.log("Servidor de node corriendo en el puerto: ", puerto);
})