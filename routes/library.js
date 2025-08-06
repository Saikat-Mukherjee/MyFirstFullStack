const express = require("express");
const fs = require("fs")
const router = express.Router()
const ejs = require("ejs")

const Blog = require("../model/blogs");
const BlogComment = require("../model/blogComments");
const blogLikes = require("../model/blogLikes");

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

async function updateLikes(userId,blogId,isLiked,callback){
    try{
        const likes = await blogLikes.find({userId : userId, blogId : blogId});
        if(likes.length > 0){
            let filter = {userId : userId, blogId : blogId};
            let update = {isLiked : isLiked};
            await blogLikes.updateOne(filter,update);
        }
        else{
            let newLikes = new blogLikes({userId : userId, blogId : blogId, isLiked : isLiked});
            await newLikes.save();
        }

        if(callback){
            callback(likes);
        }
    }catch(e){
        console.log("error ",e.message);
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

        fs.readFile("./public/HTML/common_navbar.html",'utf8',function(err,data){
            if(err){
                console.log(err);
                return;
            }
            
            var template = ejs.compile(data);
            //console.log(blogList);
            //let template_content = template({'blog_obj' : blog});
            var template_content;
            fs.readFile("./public/HTML/dashboard_new.html",'utf8',function(err,data){
                if(err){
                    console.log(err);
                    return;
                }
                let template2 = ejs.compile(data);
                //let template_content2 = template2({'blog_obj' : blog, "comment_list" : [], "blog_List" : otherBlogs });
                let template_content2 = template2({'blog_list' : blogList});
                let template_content = template({'module_template' : template_content2, "isLoggedIn" : true});
    
                res.render("LandingPage", {backend_template : template_content})
            })
    
            //res.render("LandingPage", {backend_template : template({test_header : 'Hello Nested back'})})
           
        })
})


router.post("/search",async (req,res) => {
    console.log("Inside search request");
    //console.log(req);
    console.log(req.body);
    let searchQuery = req.body.searchQuery;
    let blogList = await getBlogList(searchQuery);
    //res.json(req.body);

    /*fs.readFile("./public/HTML/dashboard.html",'utf8',function(err,data){
        if(err){
            console.log(err);
            return;
        }
        
        let template = ejs.compile(data);
        //console.log(blogList);
        let template_content = template({'blog_list' : blogList});

        //res.render("LandingPage", {backend_template : template({test_header : 'Hello Nested back'})})
        res.render("LandingPage", {backend_template : template_content})
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
            fs.readFile("./public/HTML/dashboard_new.html",'utf8',function(err,data){
                if(err){
                    console.log(err);
                    return;
                }
                let template2 = ejs.compile(data);
                //let template_content2 = template2({'blog_obj' : blog, "comment_list" : [], "blog_List" : otherBlogs });
                let template_content2 = template2({'blog_list' : blogList});
                let template_content = template({'module_template' : template_content2, "search_query" : searchQuery, "isLoggedIn" : true});
    
                res.render("LandingPage", {backend_template : template_content})
            })
    
            //res.render("LandingPage", {backend_template : template({test_header : 'Hello Nested back'})})
           
        })
})

router.post("/postComment",async(req,res) =>{
    console.log("Inside post comment");
    let comment = req.body;
    let blogId = req.query.id;
    console.log(comment);
    console.log(blogId);
    console.log("session :",req.session);
    let userName = req.session.user?.name;
    let userId = req.session.user?._id;
    //  let blogId = req.body.blogId;
    //let commentId = req.body.commentId;
     let commentObj = {
        "comment" : comment['blog-comment'],
        "commenter" : userName,
        "commentBy" : userId,
        "blogId" : blogId,
        "commentDate" : new Date()
    }

    console.log(commentObj);

    const blogComment = new BlogComment(commentObj)

    await blogComment.save();

    //res.send(req.file);
    res.redirect("/")
})

router.post("/likeBlog",async (req,res)=>{
    console.log("Inside like blog");
    let isLiked = req.body.isLiked;
    let blogId = req.query.id;
    let userId = req.session.user?._id;
   /* let bloglikes = BlogLikes.findById(blogId);
    let likeCount = blog.likeCount + 1;
    blog.likeCount = likeCount;
    blog.save();*/
    try{
        await updateLikes(userId,blogId,isLiked);
    }
    catch(e){
        console.log(e);
    }

    res.send({"ops" : "success"}).status(200);
    
})

router.post("/disLikeBlog",()=>{
    console.log("Inside dis like blog");
    let blogId = req.query.id;
    let userId = req.session.user?._id;
    let blog = Blog.findById(blogId);
    let likeCount = blog.likeCount - 1;
    blog.likeCount = likeCount;
    blog.save();
})






module.exports = router;