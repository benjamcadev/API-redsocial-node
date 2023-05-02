const mongoose = require("mongoose");

const connection = async() => {

    try {
        await mongoose.connect("mongodb://127.0.0.1:27017")
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
}