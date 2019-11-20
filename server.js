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
const config =  require("./modules/config");
const crypto = require("crypto");

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
    
    console.log(process.env.NODE_ENV);
    console.log("Server started...");
    console.log(`Server currently running on port ${PORT}`);
});

// DATABASE SETUP AND CONNECTION
config.connection.connect(function(err) {
    if (err) {
        config.log(err);
    } else {
        console.log('Connected to mysql server!');
        console.log("Checking for mysql initialization requirements...");

        config.connection.query(config.test, function(err){
            if(err){
                try{
                    config.connection.query(config.create, function(err){
                        if(err) {
                            config.log(err);
                        } else {
                            console.log("Mysql database is initialized and ready");
                        }
                    });
                }catch(error){
                    config.log(err);
                }
            }else{
                console.log("Connection to database is successful!");
            }
        });
    }
});

// APPLICATION ROUTING
app.get("/", controller.dashboard);
app.get("/login", controller.login);
app.get("/signup", controller.signup);
app.get("/passwordReset", controller.reset);
app.get("/logout", controller.logout);
app.get("/myprofile", controller.myprofile);
app.get("/myprofile/orders", controller.control);
app.get("/search", controller.search);
app.get("/view/:itemID", controller.productView);

app.post("/auth", controller.auth); // Login handler
app.post("/register", controller.register); // Sign up/Registration handler
app.post("/myprofile/update", controller.update); // Profile handler
app.post("/resetHandler", controller.resetHandler);

app.use("/api", require("./router/apiRoute"));
app.use("/categories", require("./router/categoryRoute"));

// SOCKET CONNECTION
io.on("connection", function(socket) {
    console.log(`User ${socket.id} just came online`);
    socket.on("game", function(data) {
        io.emit("game", data);
        // console.log(data);
    });

    socket.on("disconnect", function() {
        console.log(`User ${socket.id} disconnected`);
    });
});