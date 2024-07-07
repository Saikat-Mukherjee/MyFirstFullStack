const express = require("express");
const fs = require("fs")
const path = require("path");
const router = express.Router()
const ejs = require("ejs")

const Blog = require("../model/blogs");

async function getBlogById(blogId,callback){
    try{
        const blog = await Blog.findById(blogId);
        //console.log(blogs);
        if(callback){
            callback(blog);
        }
        return blog;

    }catch(e){
        console.log(e.message);
    }
}

async function getOtherBlogList(blogId,callback){
    try{
        //const blog = await Blog.findById(blogId);
        const otherBlogs = await Blog.find({}).where("_id").ne(blogId);
        if(callback){
            callback(blog);
        }

        return otherBlogs;

        }catch(e){
            console.log(e.message);
    }            
}
/* const uploadPath = path.join("public","uploads/blog images");

router.use(express.static(path.join(__dirname, 'public'))); */


router.get("/",async (req,res) =>{

    console.log("Inside get request");
    //console.log(req);
    const searchQuery = req.query;
    console.log(searchQuery);
    let blogId = req.query.id;
    //console.log(blogId);   
    let blog = await getBlogById(blogId);
    let otherBlogs = await getOtherBlogList(blogId);
    //console.log(otherBlogs);
    //res.json(blog);
    fs.readFile("./public/HTML/logged_user.html",'utf8',function(err,data){
        if(err){
            console.log(err);
            return;
        }
        
        var template = ejs.compile(data);
        //console.log(blogList);
        //let template_content = template({'blog_obj' : blog});
        var template_content;
        fs.readFile("./public/HTML/blogPage.html",'utf8',function(err,data){
            if(err){
                console.log(err);
                return;
            }
            let template2 = ejs.compile(data);
            let template_content2 = template2({'blog_obj' : blog, "comment_list" : [], "blog_List" : otherBlogs });
            let template_content = template({'module_template' : template_content2});

            res.render("LandingPage", {backend_template : template_content})
        })

        //res.render("LandingPage", {backend_template : template({test_header : 'Hello Nested back'})})
       
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