const express = require("express");
const bcrypt = require('bcrypt')
const router = express.Router()

const User = require("../model/aspirants")

async function saveData(data){
    const user = await User.create(data);

    await user.save();

    console.log(user);
}


router.get("/", (req, res) => {
    console.log("Inside Register JS");
    res.render("register", { isLoggedIn: false });
})

router.post("/",async (req,res) => {
    console.log("Inside Register JS Post");

    console.log("This is Request : ",req.body);

    const candidateDetails = req.body ? req.body : {};
    candidateDetails.password = await bcrypt.hash(candidateDetails.password,10)
    saveData(candidateDetails);
})

module.exports = router;
