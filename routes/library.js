const express = require("express");
const fs = require("fs")
const router = express.Router()

router.get("/",(req,res) => {
    res.send("You are inside your personal realm");
})

module.exports = router;