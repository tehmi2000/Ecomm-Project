"use strict";

// VARIABLE ASSIGNMENTS
const express = require("express");
const helmet = require("helmet");
const app = express();
const server = require("http").createServer(app);
const io =  require("socket.io")(server);
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const compression = require("compression");
const PORT = (process.env.PORT === "" || process.env.PORT === null || process.env.PORT === undefined)? 5000 : process.env.PORT;
const controller = require("./modules/controller");
const config =  require("./modules/config");
const { connection, userTableExist, categoryTableExist, vendorTableExist, log, mongoConn, updateExchangeRates, insertExchangeRates, itemsDB, iCollection, ratesCollection } = config;

// APPLICATION SETUP

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Only used during development
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "https://oneunivers-2-amazons3-bucket.s3.amazonaws.com");
//     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
// let requestLog = {
//     ip: req.ip,
//     url: req.url,
//     data: {
//         body: null,
//         conditions: []
//     },
//     application: req.headers['user-agent']
// }
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.use("/", express.static(__dirname + "/public"));
app.use(helmet());
app.use(compression({level: 9}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: "i am a secret",
    resave: true,
    saveUninitialized: true
}));
app.use(fileUpload());

server.listen(PORT, "0.0.0.0", function() {
    console.log("Server started...");
    console.log(`Server currently running on port ${PORT}`);
});

// DATABASE SETUP AND CONNECTION
connection.connect(function(err) {
    if (err) {
        log(err);
    } else {
        console.log('Connected to mysql server!');
        console.log("Checking for mysql initialization requirements...");

        userTableExist();
        categoryTableExist();
        vendorTableExist();
    }
});

mongoConn.then(client => {
    const collection = client.db(itemsDB).collection(iCollection);
    // collection.dropIndexes();
    // collection.createIndex({"item-name": "text", "categories": "text"}).then(response => {
    //     console.log(response);
    // }).catch(error => {
    //     console.log(error);
    // });

}).catch(error => {
    log(error);
});

// Update exchange rates data
mongoConn.then(client => {
    // Get current exchange rates...
    let collection = client.db(itemsDB).collection(ratesCollection);
    collection.find({}).toArray((err, [result]) => {
        if (err) log(err);

        if(result && result.lastModified !== config.fullDate){
            console.log("Updating data instead");
            updateExchangeRates();
        }else{
            if(!result){
                console.log("Inserting data instead");
                insertExchangeRates();
            }
        }
        // console.log(result);
    });

}).catch(error => {
    log(error);
});


// APPLICATION ROUTING
// app.get("*", function(request, response) {
//     response.redirect(`https://${request.headers.host}${request.url}`);
// });

app.get("/", controller.dashboard);
app.get("/passwordReset", controller.reset);
app.get("/logout", controller.logout);
app.get("/myprofile/orders", controller.control);
app.get("/view/:itemID", controller.productView);
app.get("/vendors/pay/success", controller.paymentSuccess);
app.get("/vendors/vendor-apply", controller.vendorApplication);
app.get('/vendors/public_store/:sellerID', controller.publicStore);
app.get("/support", controller.support);

app.post("/upload", controller.cloudUpload);
app.post("/auth", controller.auth); // Login handler
app.post("/register", controller.register); // Sign up/Registration handler
app.post("/vendor-register", controller.vendorRegister); // Vendor Sign up/Registration handler
app.post("/myprofile/update", controller.update); // Profile handler
app.post("/resetHandler", controller.resetHandler);
app.post("/submitComplaint", controller.submitComplaint);

app.use("/api", require("./router/apiRoute"));
app.use("/categories", require("./router/categoryRoute"));
app.use("/payment", require("./router/paymentRoute"));
app.use("/pay-status", require("./router/webHook"));

// SOCKET CONNECTION
io.on("connection", (socket) => {
    console.log(`User ${socket.id} is Connected`);

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
    });
});