if(process.env.NODE_ENV != 'production'){ //used for checking if the code running in Production
    require("dotenv").config()
}

const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const methodOverride = require("method-override") 

//configuration for uploading images in a destination folder
const uploadPath = path.join("public","uploads/blog images");
const imageMimeTypes = ["image/jpeg","image/png","image/gif"];
const upload = multer({
    dest : uploadPath,
   fileFilter : (req,file, callback) => {
        
        callback(null,imageMimeTypes.includes(file.mimetype));
    }
})

//const upload = multer({ dest: 'uploads/' })

const User = require("./model/aspirants");

const Blog = require("./model/blogs");

async function getUsers(callback){
    try{
        const users = await User.find({});
        //console.log(users);
        /*if(callback){
            callback(users);
        }*/
        return users;

    }catch(e){
        console.log(e.message);
    }
}

//mongoose.connect("mongodb://localhost/platformdb")
mongoose.connect(process.env.DATABASE_URL)

const db = mongoose.connection;
db.on('error', error => console.error(error))
db.once('open',() => console.log("Connected to Mongoose"))

const app = express()

//console.log("Hello World before after refresh V2");

app.engine('html', require('ejs').renderFile);

app.use(express.urlencoded({extended : true}))  //this line of code is required to access html body from backend
app.use(express.json()) //to deal with json parameters

app.set('view engine', 'html');

app.use(express.static('public'));

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: true
}))

app.use(methodOverride('_method'))

  // middleware to test if authenticated
function isAuthenticated (req, res, next) {
    //console.log(req.session.user);

    if (req.session.user){
        return next()
    } 
    
    return res.redirect("/login");
}


function isNotAuthenticated (req, res, next) {
    if (req.session.user){
        return res.redirect("/");
    }
    
    next(); 
}

function createSession(obj){
   
    return obj;
 }

 /*async function saveData(data){
    const user = await User.create(data);

    await user.save();

    console.log(user);
}*/

app.get("/login",isNotAuthenticated,(req,res) => {
    //console.log("Hello World");

    
    //res.send("Hello World : Landing Page");
   
    fs.readFile("./public/HTML/login.html",'utf8',function(err,data){
        if(err){
            console.log(err);
            return;
        }
        //console.log(data);
        //res.send({"html" : data});
        res.render("LandingPage", {backend_template : data});
    })
    //res.render("LandingPage", {backend_template : "World"})
})

app.get("/loginPage",(req,res) => {
    console.log("Inside Console /login");
    //console.log(req.body);

   
})

app.post("/users",isNotAuthenticated,async (req,res) => {
    console.log("Inside Console /login v2");
    console.log(req.body);
    let reqCredentials = req.body ? req.body : {};
    let userlist =  await getUsers();
    //console.log(userlist);
    let userCred = userlist.find(key=> (key['name'] == reqCredentials.userName || key['email'] == reqCredentials.userName));

    //if(userlist.find(key=> (key['name'] == reqCredentials.userName || key['email'] == reqCredentials.userName) && key['password'] == reqCredentials.password)){
    if(userCred){
        let matchPass = await bcrypt.compare(reqCredentials.password, userCred.password);
        if(matchPass){
            req.session.user = createSession(userCred);   
            res.send({"credential" : true});
            //res.redirect("/");
        }
        else{
            res.send({"credential" : false});    
        }    
    }
    else{
        res.send({"credential" : false});    
    }
   
})

app.post("/blog-create",isAuthenticated,upload.single('blogImage'),async (req,res) =>{
    //app.post("/blog-create",upload.none(),async (req,res) =>{
    console.log("<------------Inside blog-create----->");
    const filename = req.file != null ? req.file.filename : null;
    console.log(req.file);

    console.log(req.body);

    const blog = new Blog({
        title : req.body.title,
        content : req.body.content,
        blogImage : filename
    })

    await blog.save();

    //res.send(req.file);
    res.redirect("/")

})

/*app.post("/upload",upload.single('avatar'),(req,res) => {
    console.log("Inside Upload");
    console.log(req.file);
    res.json(req.file);
    
})*/


const loginRouter = require("./routes/register")

app.use("/register",isNotAuthenticated,loginRouter);

const personalSpaceRouter = require("./routes/library")

app.use("/",isAuthenticated,personalSpaceRouter);

app.delete("/logout",isAuthenticated, (req,res) => {
    req.session.destroy(() => console.log("Session has expired"));
    res.redirect("/login")
})

//for hosting use the first the server will dynamically allocate port
app.listen(process.env.PORT || 3000)