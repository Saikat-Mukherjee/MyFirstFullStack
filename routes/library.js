const express = require("express");
const fs = require("fs")
const router = express.Router()

router.get("/",(req,res) => {
    //res.send("You are inside your personal realm");

    fs.readFile("./public/HTML/dashboard.html",'utf8',function(err,data){
        if(err){
            console.log(err);
            return;
        }
        
        res.render("LandingPage", {backend_template : data})
    })
})

module.exports = router;