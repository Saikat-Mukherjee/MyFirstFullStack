const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
    title : String,
    content : String,
    blogImage : String
})

module.exports = mongoose.model("blogs",blogSchema);