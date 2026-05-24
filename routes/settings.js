const express = require("express");
const bcrypt = require('bcrypt')
const moment = require("moment")
const router = express.Router()

const User = require("../model/aspirants")
const DateFormat = "YYYY-MM-DD";

async function getAspirant(id,callback){
    try{
        const aspirant = await User.findById(id);
        if(callback){
            callback(aspirant);
            }
            return aspirant;

            }catch(e){
                console.log(e.message);
        }
            
}

async function updateUserData(id,modifiedData,res,callback){
    const filter = { _id: id };
    const update = modifiedData;

    try{
        let result = await User.updateOne(filter, update);
        return res.status(200).send(result);
    }
    catch(e){
        console.error(err);
        return res.status(500).send(err);
    }
}

    

function getFormattedDate(givenDate){
    return moment(givenDate).format(DateFormat);
}

router.get("/",async(req,res) => {
    console.log("Inside Setting Menu");
    let userId = req.session.user?._id;

    let userDetails;
    try {
        userDetails = await getAspirant(userId)
    }
    catch(e){
        console.error("Data Not Found ",e);
    }
    
    console.log("userDetails ", userDetails);

    res.render("settings", { user_details: userDetails, getFormattedDate, isLoggedIn: true });
})

router.post("/", (req,res) => {
    console.log("Inside setting post");

    let userId = req.session.user?._id;

    console.log("This is Request : ",req.body);

    const candidateDetails = req.body ? req.body : {};
    //candidateDetails.password = await bcrypt.hash(candidateDetails.password,10)
    updateUserData(userId,candidateDetails,res);
})

module.exports = router;