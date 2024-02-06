const express = require("express");
const fs = require("fs")
const bcrypt = require('bcrypt')
const router = express.Router()

const User = require("../model/aspirants")

async function saveData(data){
    const user = await User.create(data);

    await user.save();

    console.log(user);
}


router.get("/",(req,res) => {
    console.log("Inside Register JS");

   // res.send("Inside Login Page");
    //console.log("This is res :: ", res);

    fs.readFile("./public/HTML/register_form.html",'utf8',function(err,data){
        if(err){
            console.log(err);
            return;
        }
        //console.log(data);
        //res.send({"html" : data});
        //var htmlContent = "<b>HELLO</b>";
        res.render("LandingPage", {backend_template : data})
    })
})

router.post("/",async (req,res) => {
    console.log("Inside Register JS Post");

    console.log("This is Request : ",req.body);

    const candidateDetails = req.body ? req.body : {};
    candidateDetails.password = await bcrypt.hash(candidateDetails.password,10)
    saveData(candidateDetails);
})

module.exports = router;
