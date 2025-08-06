const express = require("express");
const fs = require("fs")
const ejs = require("ejs")
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

    /*fs.readFile("./public/HTML/register_form.html",'utf8',function(err,data){
        if(err){
            console.log(err);
            return;
        }
        //console.log(data);
        //res.send({"html" : data});
        //var htmlContent = "<b>HELLO</b>";
        res.render("LandingPage", {backend_template : data})
    })*/

        fs.readFile("./public/HTML/common_navbar.html",'utf8',function(err,data){
            if(err){
                console.log(err);
                return;
            }
            
            var template = ejs.compile(data);
            //console.log(blogList);
            //let template_content = template({'blog_obj' : blog});
            var template_content;
            fs.readFile("./public/HTML/register_form.html",'utf8',function(err,data){
                if(err){
                    console.log(err);
                    return;
                }
                let template2 = ejs.compile(data);
                //let template_content2 = template2({'blog_obj' : blog, "comment_list" : [], "blog_List" : otherBlogs });
                let template_content2 = template2({});
                let template_content = template({'module_template' : template_content2});
                //let template_content = template({'module_template' : data});
    
                res.render("LandingPage", {backend_template : template_content})
            })
    
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
