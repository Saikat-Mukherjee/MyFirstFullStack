if(process.env.NODE_ENV != 'production'){
    require("dotenv").config()
}

const express = require("express")
const fs = require("fs")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const User = require("./model/aspirants")

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

app.get("/",(req,res) => {
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

app.post("/users",async (req,res) => {
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
        res.send({"credential" : true});
        }
        else{
            res.send({"credential" : false});    
        }    
    }
    else{
        res.send({"credential" : false});    
    }
   
})


const loginRouter = require("./routes/register")

app.use("/register",loginRouter);

const personalSpaceRouter = require("./routes/library")

app.use("/custom",personalSpaceRouter);

//for hosting use the first the server will dynamically allocate port
app.listen(process.env.PORT || 3000)