const express = require("express");
const path = require("path");
const moment = require("moment");
const router = express.Router()

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

async function getOtherBlogList(blogId,limit,skip,callback){
    try{
        //const blog = await Blog.findById(blogId);
        const otherBlogs = await Blog.find({}).where("_id").ne(blogId).limit(Number(limit)).skip(skip);
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

    console.log("Inside a Blog");
    //console.log(req);
    const searchQuery = req.query;
    console.log(searchQuery);
    let blogId = req.query.id;
    //const { page = 1, limit = 10 } = req.query;
    const page = 1, limit = 5; // Reduced initial limit for better lazy loading
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;
    //console.log(blogId);   
    let blog = await getBlogById(blogId);
    let otherBlogs = await getOtherBlogList(blogId,limit,skip);
    let blogComments = await getBlogComments(blogId);
    let aspirantList = await getAllAspirants();
    aspirantObj = aspirantList.reduce((acc, item) => {
        acc[item._id] = item.name;
        return acc;
      }, {});
    
    console.log(blogComments);
    res.render("blog", {
        blog_obj: blog,
        blog_List: otherBlogs,
        comment_list: blogComments,
        getUserName,
        getFormattedTime,
        isLoggedIn: true
    });
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

// API endpoint for lazy loading more blogs
router.get("/api/more-blogs", async (req, res) => {
    try {
        const { currentBlogId, page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;
        
        const moreBlogs = await getOtherBlogList(currentBlogId, limit, skip);

        req.app.render('partials/blog-card', { blog_List: moreBlogs, getFormattedTime }, (err, html) => {
            if (err) {
                console.error("Template render error:", err);
                return res.status(500).json({ error: "Failed to render blog cards" });
            }
            res.json({
                html,
                hasMore: moreBlogs.length === parseInt(limit)
            });
        });
    } catch (error) {
        console.error("Error loading more blogs:", error);
        res.status(500).json({ error: "Failed to load more blogs" });
    }
});


module.exports = router;