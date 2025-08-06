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
    //console.log(otherBlogs);
    //res.json(blog);
    fs.readFile("./public/HTML/common_navbar.html",'utf8',function(err,data){
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
            let template_content = template({'module_template' : template_content2, "isLoggedIn" : true});

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

// API endpoint for lazy loading more blogs
router.get("/api/more-blogs", async (req, res) => {
    try {
        const { currentBlogId, page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;
        
        const moreBlogs = await getOtherBlogList(currentBlogId, limit, skip);
        
        // Render just the blog cards HTML
        fs.readFile("./public/HTML/blog-card-template.html", 'utf8', function(err, data) {
            if (err) {
                console.log("Template file not found, using inline template");
                // Inline template if file doesn't exist
                let cardsHtml = '';
                moreBlogs.forEach(item => {
                    cardsHtml += `
                    <div class="col-12">
                        <div class="card h-100" style="cursor: pointer;" onclick="window.location.href='/blog?id=${item._id}'">
                            <img src="uploads/blog images/${item.blogImage || ''}" class="card-img-top" width="200" height="200" alt="${item.title || 'Blog image'}">
                            <div class="card-body">
                                <h5 class="card-title blog-thumb-nail-title">${item.title || ''}</h5>
                                <p class="card-text">${item.content ? item.content.substring(0, 100) + '...' : 'No description available.'}</p>
                            </div>
                            <div class="card-footer">
                                <small class="text-muted">Last updated ${item.updatedAt ? getFormattedTime(item.updatedAt) : 'recently'}</small>
                            </div>
                        </div>
                    </div>`;
                });
                res.json({ 
                    html: cardsHtml,
                    hasMore: moreBlogs.length === parseInt(limit)
                });
            } else {
                const template = ejs.compile(data);
                const html = template({ 
                    blog_List: moreBlogs, 
                    getFormattedTime: getFormattedTime 
                });
                res.json({ 
                    html: html,
                    hasMore: moreBlogs.length === parseInt(limit)
                });
            }
        });
    } catch (error) {
        console.error("Error loading more blogs:", error);
        res.status(500).json({ error: "Failed to load more blogs" });
    }
});


module.exports = router;