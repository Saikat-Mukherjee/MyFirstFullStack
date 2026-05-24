const express = require("express");
const router = express.Router()

const Blog = require("../model/blogs");
const BlogComment = require("../model/blogComments");
const BlogLikes = require("../model/blogLikes");
const Aspirants = require("../model/aspirants");

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

async function updateLikes(userId, blogId, isLiked, callback) {
    try {
        // Find existing like record for this user and blog
        const existingLike = await BlogLikes.findOne({
            userId: userId, 
            blogId: blogId, 
            type: 'like'
        });
        
        if (isLiked) {
            if (!existingLike) {
                // Create new like
                const newLike = new BlogLikes({
                    userId: userId,
                    blogId: blogId,
                    liked: true,
                    type: 'like',
                    createdAt: new Date()
                });
                await newLike.save();
                
                // Increment blog like count
                await Blog.findByIdAndUpdate(blogId, { $inc: { likes: 1 } });
            }
        } else {
            if (existingLike) {
                // Remove like
                await BlogLikes.findByIdAndDelete(existingLike._id);
                
                // Decrement blog like count (don't let it go below 0)
                await Blog.findByIdAndUpdate(blogId, { 
                    $inc: { likes: -1 },
                    $max: { likes: 0 }
                });
            }
        }

        if (callback) {
            callback(existingLike);
        }
    } catch (e) {
        console.log("error in updateLikes:", e.message);
        throw e; // Re-throw error for proper error handling
    }
}


router.get("/", async (req, res) => {
    console.log("Inside personal space " + req.session.user.name);
    const blogList = await getBlogList();
    res.render("dashboard", { blog_list: blogList, isLoggedIn: true });
})


router.post("/search", async (req, res) => {
    console.log("Inside search request");
    const searchQuery = req.body.searchQuery;
    const blogList = await getBlogList(searchQuery);
    res.render("dashboard", { blog_list: blogList, isLoggedIn: true, search_query: searchQuery });
})

router.post("/postComment",async(req,res) =>{
    console.log("Inside post comment");
    
    try {
        const comment = req.body;
        const blogId = req.query.id;
        const userName = req.session.user?.name;
        const userId = req.session.user?._id;
        
        console.log("Comment data:", comment);
        console.log("Blog ID:", blogId);
        console.log("User session:", req.session);
        
        // Validation
        const errors = [];
        
        // Check if user is authenticated
        if (!userId || !userName) {
            return res.status(401).json({ 
                success: false, 
                message: "User not authenticated",
                redirect: "/login"
            });
        }
        
        // Validate blog ID
        if (!blogId || !blogId.match(/^[0-9a-fA-F]{24}$/)) {
            errors.push("Invalid blog ID");
        }
        
        // Validate comment content
        const commentText = comment['blog-comment']?.trim();
        if (!commentText) {
            errors.push("Comment cannot be empty");
        } else if (commentText.length < 1) {
            errors.push("Comment must be at least 1 character long");
        } else if (commentText.length > 1000) {
            errors.push("Comment cannot exceed 1000 characters");
        }
        
        // Check for spam (basic validation)
        const spamWords = ['spam', 'click here', 'buy now', 'free money'];
        const hasSpam = spamWords.some(word => 
            commentText.toLowerCase().includes(word.toLowerCase())
        );
        if (hasSpam) {
            errors.push("Comment contains inappropriate content");
        }
        
        // If validation fails
        if (errors.length > 0) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json({
                    success: false,
                    errors: errors,
                    message: errors.join(', ')
                });
            } else {
                // For form submission, redirect back with error
                req.session.commentError = errors.join(', ');
                return res.redirect(`/blog?id=${blogId}&error=comment`);
            }
        }
        
        // Check if blog exists
        const blogExists = await Blog.findById(blogId);
        if (!blogExists) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found"
                });
            } else {
                req.session.commentError = "Blog not found";
                return res.redirect("/");
            }
        }
        
        // Rate limiting check (prevent spam)
        const recentComments = await BlogComment.find({
            commentBy: userId,
            commentDate: { $gte: new Date(Date.now() - 60000) } // Last minute
        });
        
        if (recentComments.length >= 3) {
            const error = "Too many comments. Please wait before commenting again.";
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(429).json({
                    success: false,
                    message: error
                });
            } else {
                req.session.commentError = error;
                return res.redirect(`/blog?id=${blogId}&error=rate_limit`);
            }
        }
        
        // Create comment object
        const commentObj = {
            comment: commentText,
            commenter: userName,
            commentBy: userId,
            blogId: blogId,
            commentDate: new Date(),
            isEdited: false,
            editedAt: null
        };
        
        console.log("Creating comment:", commentObj);
        
        // Save comment
        const blogComment = new BlogComment(commentObj);
        await blogComment.save();
        
        // If it's an AJAX request, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json({
                success: true,
                message: "Comment posted successfully",
                comment: {
                    id: blogComment._id,
                    comment: commentText,
                    commenter: userName,
                    commentDate: commentObj.commentDate
                }
            });
        } else {
            // For form submission, redirect back to blog
            req.session.commentSuccess = "Comment posted successfully";
            res.redirect(`/blog?id=${blogId}`);
        }
        
    } catch (error) {
        console.error("Error posting comment:", error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        } else {
            req.session.commentError = "An error occurred while posting your comment";
            res.redirect("/");
        }
    }
})

router.post("/likeBlog",async (req,res)=>{
    console.log("Inside like blog");
    
    try {
        const isLiked = req.body.isLiked;
        const blogId = req.query.id;
        const userId = req.session.user?._id;
        
        // Validation
        const errors = [];
        
        // Check if user is authenticated
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User not authenticated",
                redirect: "/login"
            });
        }
        
        // Validate blog ID
        if (!blogId || !blogId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }
        
        // Validate isLiked parameter
        if (typeof isLiked !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Invalid like status"
            });
        }
        
        // Check if blog exists
        const blogExists = await Blog.findById(blogId);
        if (!blogExists) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Rate limiting for likes (prevent spam clicking)
        const recentLikes = await BlogLikes.find({
            userId: userId,
            blogId: blogId,
            createdAt: { $gte: new Date(Date.now() - 5000) } // Last 5 seconds
        });
        
        if (recentLikes.length >= 3) {
            return res.status(429).json({
                success: false,
                message: "Too many like requests. Please wait."
            });
        }
        
        // Update likes
        await updateLikes(userId, blogId, isLiked);
        
        // Get updated like count
        const updatedBlog = await Blog.findById(blogId);
        
        res.status(200).json({
            success: true,
            message: isLiked ? "Blog liked successfully" : "Blog unliked successfully",
            likes: updatedBlog.likes || 0,
            isLiked: isLiked
        });
        
    } catch (error) {
        console.error("Error in likeBlog:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
})

router.post("/dislikeBlog", async (req, res) => {
    console.log("Inside dislike blog");
    
    try {
        const isDisliked = req.body.isDisliked;
        const blogId = req.query.id;
        const userId = req.session.user?._id;
        
        // Validation
        // Check if user is authenticated
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User not authenticated",
                redirect: "/login"
            });
        }
        
        // Validate blog ID
        if (!blogId || !blogId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }
        
        // Validate isDisliked parameter
        if (typeof isDisliked !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Invalid dislike status"
            });
        }
        
        // Check if blog exists
        const blogExists = await Blog.findById(blogId);
        if (!blogExists) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Rate limiting for dislikes
        const recentDislikes = await BlogLikes.find({
            userId: userId,
            blogId: blogId,
            createdAt: { $gte: new Date(Date.now() - 5000) } // Last 5 seconds
        });
        
        if (recentDislikes.length >= 3) {
            return res.status(429).json({
                success: false,
                message: "Too many dislike requests. Please wait."
            });
        }
        
        // Update dislikes (you'll need to implement updateDislikes function)
        await updateDislikes(userId, blogId, isDisliked);
        
        // Get updated dislike count
        const updatedBlog = await Blog.findById(blogId);
        
        res.status(200).json({
            success: true,
            message: isDisliked ? "Blog disliked successfully" : "Blog undisliked successfully",
            dislikes: updatedBlog.dislikes || 0,
            isDisliked: isDisliked
        });
        
    } catch (error) {
        console.error("Error in dislikeBlog:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Helper function for updating dislikes (you may need to implement this)
async function updateDislikes(userId, blogId, isDisliked) {
    try {
        // Find existing dislike record
        const existingDislike = await BlogLikes.findOne({
            userId: userId,
            blogId: blogId,
            type: 'dislike'
        });
        
        if (isDisliked) {
            if (!existingDislike) {
                // Create new dislike
                const newDislike = new BlogLikes({
                    userId: userId,
                    blogId: blogId,
                    type: 'dislike',
                    createdAt: new Date()
                });
                await newDislike.save();
                
                // Update blog dislike count
                await Blog.findByIdAndUpdate(blogId, { $inc: { dislikes: 1 } });
            }
        } else {
            if (existingDislike) {
                // Remove dislike
                await BlogLikes.findByIdAndDelete(existingDislike._id);
                
                // Update blog dislike count
                await Blog.findByIdAndUpdate(blogId, { $inc: { dislikes: -1 } });
            }
        }
    } catch (error) {
        console.error("Error updating dislikes:", error);
        throw error;
    }
}

// Test route for validation
router.get("/test-validation", (req, res) => {
    res.json({ 
        message: "Validation routes are working!",
        user: req.session.user || null,
        timestamp: new Date()
    });
});

module.exports = router;