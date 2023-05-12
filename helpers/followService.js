const Follow = require("../models/follow");

// SACAR INFOMRACION DE SEGUIMIENTOS
const followUserIds = async(identityUserId) => {

    let following = await Follow.find({
            "user": identityUserId
        })
        .select({"followed": 1, "_id": 0}) /// cuando le pones 1 es porque quieres que traiga ese campo desde la BD, 0 es que no lo traiga
        .then(async(follows) => {
        return follows
            
        })
        .catch((error) => {
            return error;
        })

    let followers = await Follow.find({
            "followed": identityUserId
        })
        .select({"user": 1, "_id": 0}) /// cuando le pones 1 es porque quieres que traiga ese campo desde la BD, 0 es que no lo traiga
        .then(async(followed) => {
        return followed
            
        })
        .catch((error) => {
            return error;
        })

        //PROCESAR ARRAY DE IDENTIFICADORES
        let followingClean = [];

        following.forEach(follow => {
            followingClean.push(follow.followed);
        })

        let followersClean = [];

        following.forEach(follow => {
            followersClean.push(follow.user);
        })
   
   

        return {
            following: followingClean,
            followers: followersClean
        }

}

const followThisUser = async(identityUserId,profileUserId) => {
    let following = await Follow.findOne({
            "user": identityUserId,
            "followed": profileUserId
        })
        .then(async(follows) => {
        return follows
            
        })
        .catch((error) => {
            return error;
        })

    let follower = await Follow.findOne({
            "user": profileUserId,
            "followed": identityUserId
        })
        .then(async(followed) => {
        return followed
            
        })
        .catch((error) => {
            return error;
        })

        return {
            following,
            follower
        }
}

module.exports = {
    followUserIds,
    followThisUser
}