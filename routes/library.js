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

router.get("/?searchQuery=:searchQuery",async (req,res) => {
    console.log("Inside get request");
})

router.get("/blogs",async (req,res) => {
    console.log("Inside get request");
    //console.log(req);
    const searchQuery = req.query;
    console.log(searchQuery);
    let blogId = req.query.id;
    console.log(blogId);   
    let blog = await getBlogById(blogId);
    res.json(blog);
})

router.get("/blogs/?id=:id",async (req,res) => {
    console.log("Inside get request");
    let blogId = req.params.id;   
    let blog = await getBlogById(blogId);
    res.json(blog);
})

router.get("/",async (req,res) => {
    //res.send("You are inside your personal realm");
    console.log(req.params);
    console.log("Inside personal space " + req.session.user.name);
    let blogList = await getBlogList();
    
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






module.exports = router;