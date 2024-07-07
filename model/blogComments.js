const mongoose = require("mongoose");

const blogCommentsSchema = mongoose.Schema({
    blogId : String,
    comment : String,
    commentBy : String,
    commentDate : Date
})

module.exports = mongoose.model("blogComments",blogCommentsSchema);