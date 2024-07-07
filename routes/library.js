const express = require("express");
const fs = require("fs")
const router = express.Router()
const ejs = require("ejs")

const Blog = require("../model/blogs");

async function getBlogList(searchQuery,callback){
    searchQuery = searchQuery || "";
    try{
        const blogs = await Blog.find({blogImage : { "$exists": true },title : {$regex : searchQuery}});
        //console.log(blogs);
        if(callback){
            callback(blogs);
        }
        return blogs;

    }catch(e){
        console.log(e.message);
    }
}


router.get("/",async (req,res) => {
    //res.send("You are inside your personal realm");
    console.log(req.params);
    console.log("Inside personal space " + req.session.user.name);
    let blogList = await getBlogList();
    
   /*  fs.readFile("./public/HTML/dashboard.html",'utf8',function(err,data){
        if(err){
            console.log(err);
            return;
        }
        
        let template = ejs.compile(data);
        //console.log(blogList);
        let template_content = template({'blog_list' : blogList});

        //res.render("LandingPage", {backend_template : template({test_header : 'Hello Nested back'})})
        res.render("LandingPage", {backend_template : template_content})
    }) */

        fs.readFile("./public/HTML/logged_user.html",'utf8',function(err,data){
            if(err){
                console.log(err);
                return;
            }
            
            var template = ejs.compile(data);
            //console.log(blogList);
            //let template_content = template({'blog_obj' : blog});
            var template_content;
            fs.readFile("./public/HTML/dashboard.html",'utf8',function(err,data){
                if(err){
                    console.log(err);
                    return;
                }
                let template2 = ejs.compile(data);
                //let template_content2 = template2({'blog_obj' : blog, "comment_list" : [], "blog_List" : otherBlogs });
                let template_content2 = template2({'blog_list' : blogList});
                let template_content = template({'module_template' : template_content2});
    
                res.render("LandingPage", {backend_template : template_content})
            })
    
            //res.render("LandingPage", {backend_template : template({test_header : 'Hello Nested back'})})
           
        })
})


router.post("/search",async (req,res) => {
    console.log("Inside post request");
    console.log(req.body);
    let searchQuery = req.body.searchQuery;
    let blogList = await getBlogList(searchQuery);
    //res.json(req.body);

    fs.readFile("./public/HTML/dashboard.html",'utf8',function(err,data){
        if(err){
            console.log(err);
            return;
        }
        
        let template = ejs.compile(data);
        //console.log(blogList);
        let template_content = template({'blog_list' : blogList});

        //res.render("LandingPage", {backend_template : template({test_header : 'Hello Nested back'})})
        res.render("LandingPage", {backend_template : template_content})
    })
})

router.post("/postComment",async(req,res) =>{
    console.log("Inside post comment");
    let comment = req.body;
    console.log(comment);
    /*let blogId = req.body.blogId;
    let commentId = req.body.commentId;
    let commentObj = {
        "commentId" : commentId,
        "comment" : comment.comment,
        "commenter" : comment.commenter,
        "commenterId" : comment.commenterId,
        "blogId" : blogId
        }*/
})






module.exports = router;