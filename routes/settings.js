const express = require("express");
const fs = require("fs")
const bcrypt = require('bcrypt')
const ejs = require("ejs")
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
    
    console.log("userDetails ",userDetails);
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
            let template_content2 = template2({"user_details" : userDetails ,"getFormattedDate" : getFormattedDate});
            let template_content = template({'module_template' : template_content2});

            res.render("LandingPage", {backend_template : template_content})
        })

    })
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