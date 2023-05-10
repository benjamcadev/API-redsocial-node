const {Schema, model} = require("mongoose");

const FollowSchema = Schema({
    user: {
        type: Schema.ObjectId, // ESTO HACE UNA REFERENCIA A OTRO SCHEMA DE OBJETO
        ref: "User" // ACA LE INDICAS A QUE SCHEMA DEBE IR EN ESTE CASO USER
    },
    followed: {
        type: Schema.ObjectId,
        ref: "User"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("Follow", FollowSchema, "follows");

