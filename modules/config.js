const model = function(){

    const fs = require("fs");
    const mysql = require("mysql");
    const mongodb = require("mongodb").MongoClient;
    const ObjectID = require("mongodb").ObjectId;
    const mailer = require("nodemailer");

    const ePass = {user: "fbnquestreminderapp@gmail.com"};

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

    const query_create = "CREATE TABLE users (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, uID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, telcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
    const query_test = "SELECT * FROM users";

    // LOCALHOST CONNECTION
    /* const conn = mysql.createConnection({
        host: 'localhost',
        user: 'tehmi2000',
        password: 'tehmitemi1#',
        database: "ecomm_db"
    });
    
    const MONGO_URL = "mongodb://localhost:27017"
    */

    // AZURE MYSQL CONNECTION
   	const conn = mysql.createConnection({
   		host: "temi.mysql.database.azure.com",
   	    port: 3306,
   	    user: "temi@temi",
        password: "Re$et@123",
        database: "ecomm_db"
    });
     
    const MONGO_URL = "mongodb://localhost:27017";

    const log = function(err) {
        let content = `${(new Date).toUTCString()}: ${JSON.stringify(err)}` + "\n";
        fs.appendFile("./error_log.txt", content, function(err) {
            if(err){
                console.log(err);
            }
        });
        // throw err;
        console.error(err);
    };

    return {
        log,
        ePass,
        transporter,
        ObjectID,
        connection: conn,

        MONGO_CLIENT: mongodb,
        MONGO_URL,
        mOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        itemsDB: "globalDB",
        iCollection: "goods",
        
        create: query_create,
        test: query_test
    };
};

module.exports = model();