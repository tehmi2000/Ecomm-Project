const model = function(){

    const fs = require("fs");
    const mysql = require("mysql");
    const mongodb = require("mongodb").MongoClient;
    const ObjectID = require("mongodb").ObjectId;
    const mailer = require("nodemailer");

    const ePass = {user: "universone132@gmail.com"};

    Object.defineProperty(ePass, "pass", {
        value: "aaf4a41d0f7c4d3ebbfe3b82d875ec",
        writable: true,
        configurable: true,
        enumerable: true
    });

    const transporter = mailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: ePass['user'],
            pass: ePass['pass']
        }
    });

    const queryCreate = "CREATE TABLE users (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, uID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, telcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL, verification_status BOOLEAN) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
    const queryTest = "SELECT * FROM users LIMIT 1";

    // LOCALHOST CONNECTION
    // const conn = mysql.createConnection({
    //     host: 'localhost',
    //     port: 3306,
    //     user: 'tehmi2000',
    //     password: 'tehmitemi1#',
    //     database: "ecomm_db"
    // });
    
    // const MONGO_URL = "mongodb://localhost:27017";

    // AZURE MYSQL CONNECTION
    // const conn = mysql.createConnection({
    //     host: "temi.mysql.database.azure.com",
    //     port: 3306,
    //     user: "temi@temi",
    //     password: "Re$et@123",
    //     database: "ecomm_db"
    // });
    
    // JAWDB MYSQL CONNECTION
    const conn = mysql.createConnection({
    	host: "l9dwvv6j64hlhpul.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    	port: 3306,
    	user: "rhc66ah245c891u6",
    	password: "e7dppzf8a4wc7zf0",
    	database: "mvqa2ejzg5zltrc0"
    });

    // ATLAS MONGODB CONNECTION
    const MONGO_URL = "mongodb+srv://universAdmin:Re$et123@univers-cluster-uvdln.azure.mongodb.net/test?retryWrites=true&w=majority";

    const log = function(err) {
        let content = `${(new Date).toUTCString()}: ${JSON.stringify(err)}` + "\n";
        fs.appendFile("./error_log.txt", content, function(err) {
            if(err){
                console.log(err);
            }
        });
        console.error(err);
    };

    const mOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    const mongoConn = MONGO_CLIENT.connect(MONGO_URL, mOptions);

    return {
        log,
        ePass,
        transporter,
        ObjectID,
        connection: conn,
        mongoConn,
        itemsDB: "globalDB",
        iCollection: "goods",
        create: queryCreate,
        test: queryTest
    };
};

module.exports = model();