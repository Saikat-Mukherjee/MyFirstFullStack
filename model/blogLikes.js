const mongoose = require("mongoose");

const blogLikedSchema = mongoose.Schema({
    blogId : String,
    userId : String,
    liked : Boolean
})

module.exports = mongoose.model("blogLikes",blogLikedSchema);