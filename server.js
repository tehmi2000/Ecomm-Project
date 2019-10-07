"use strict";

// VARIABLE ASSIGNMENTS
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io =  require("socket.io")(server);
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const PORT = (process.env.PORT === "" || process.env.PORT === null || process.env.PORT === undefined)? 5000 : process.env.PORT;
const controller = require("./modules/controller");
const mysql_config =  require("./modules/config");

// APPLICATION SETUP
app.use("/", express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: "i am a secret",
    resave: true,
    saveUninitialized: true
}));
server.listen(PORT, "0.0.0.0", function() {
    console.log(`Server currently running on port ${PORT}`);
});

// DATABASE SETUP AND CONNECTION
mysql_config.connection.connect(function(err) {
    if (err) throw err;

    console.log('Connected to mysql server!');
    console.log("Checking for mysql initialization requirements...");

    mysql_config.connection.query(mysql_config.test, function(err){
        if(err){
            try{
                mysql_config.connection.query(mysql_config.create, function(err){
                    if(err) throw err;
                    console.log("Mysql database is initialized and ready");
                });
            }catch(error){
                throw error;
            }
        }else{
            console.log("Connection to database is successful!");
        }
    });
});

// APPLICATION ROUTING
app.get("/", controller.dashboard);
app.get("/login", controller.login);
app.get("/signup", controller.signup);
app.get("/logout", controller.logout);
app.get("/myprofile", controller.myprofile);
app.get("/search", controller.search);

app.post("/auth", controller.auth); // Login handler
app.post("/register", controller.register); // Sign up/Registration handler

app.use("/categories", require("./router/categoryRoute"));