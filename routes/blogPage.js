const express = require("express");
const fs = require("fs")
const path = require("path");
const moment = require("moment");
const router = express.Router()
const ejs = require("ejs")

const Blog = require("../model/blogs");
const BlogComment = require("../model/blogComments");
const Aspirants = require("../model/aspirants");

var aspirantObj = {};

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

async function getBlogComments(blogId,callback){
    try{
        const blogComments = await BlogComment.find({blogId : blogId});
        if(callback){
            callback(blogComments);
            }
            return blogComments;
        }catch(e){
                console.log(e.message);
        }

}

async function getAllAspirants(callback){
    try{
        const aspirants = await Aspirants.find({});
        if(callback){
            callback(aspirants);
            }
            return aspirants;

            }catch(e){
                console.log(e.message);
        }
            
}

function getUserName(userId) {
    return aspirantObj && aspirantObj[userId] ? aspirantObj[userId] :  "No user found";
}

function getFormattedTime(dateTime) {
    //var date = new Date();
    const date1 = moment(dateTime);
    const date2 = moment();

    const yearsDifference = date2.diff(date1, 'years');
    if(yearsDifference >= 1){
        return yearsDifference + " year" + (yearsDifference > 1 ? "s" : "") + " ago";
    }

    const monthsDifference = date2.diff(date1, 'months');
    if(monthsDifference >= 1){
        return monthsDifference + " month" + (monthsDifference > 1 ? "s" : "") + " ago";
    }

    const weeksDifference = date2.diff(date1, 'weeks');
    if(weeksDifference >= 1){
        return weeksDifference + " week" + (weeksDifference > 1 ? "s" : "") + " ago";
    }

    const daysDifference = date2.diff(date1, 'days');
    if(daysDifference >= 1){
        return daysDifference + " day" + (daysDifference > 1 ? "s" : "") + " ago";
    }

    const hoursDifference = date2.diff(date1, 'hours');
    if(hoursDifference >= 1){
        return hoursDifference + " hour" + (hoursDifference > 1 ? "s" : "") + " ago";
    }

    const minutesDifference = date2.diff(date1, 'minutes');
    if(minutesDifference >= 1){
        return minutesDifference + " minute" + (minutesDifference > 1 ? "s" : "") + " ago";
    }

    const secondsDifference = date2.diff(date1, 'seconds');
    if(secondsDifference >= 1){
        return secondsDifference + " second" + (secondsDifference > 1 ? "s" : "") + " ago";
    }    
    

    //console.log(`Days: ${daysDifference}, Hours: ${hoursDifference}, Minutes: ${minutesDifference}, Seconds: ${secondsDifference}`);

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
    let blogComments = await getBlogComments(blogId);
    let aspirantList = await getAllAspirants();
    aspirantObj = aspirantList.reduce((acc, item) => {
        acc[item._id] = item.name;
        return acc;
      }, {});
    
    console.log(blogComments);
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
            let template_content2 = template2({'blog_obj' : blog, "comment_list" : [], "blog_List" : otherBlogs , "comment_list" : blogComments, "getUserName" : getUserName, "getFormattedTime" : getFormattedTime});
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