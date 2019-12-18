const model = function(){

    const fs = require("fs");
    const mysql = require("mysql");
    const MONGO_CLIENT = require("mongodb").MongoClient;
    const ObjectID = require("mongodb").ObjectId;
    const mailer = require("nodemailer");
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const ePass = {user: process.env.EMAIL_USERNAME};

    Object.defineProperty(ePass, "pass", {
        value: process.env.EMAIL_PASS,
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

    // const queryCreate = "CREATE TABLE users (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, uID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, telcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL, verification_status BOOLEAN) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
    // const queryTest = "SELECT * FROM users LIMIT 1";

    // LOCALHOST CONNECTION
    // const conn = mysql.createConnection({
    //     host: 'localhost',
    // 	port: 3306,
    //     user: 'root',
   	//     password: '',
    //     database: "ecomm_db"
    // });
    
    // const MONGO_URL = "mongodb://localhost:27017";

    // AZURE MYSQL CONNECTION
    // const conn = mysql.createConnection({
    //     host: "temi.mysql.database.azure.com",
    //     port: 3306,
    //     user: "temi@temi",
    //     password: "Re$et@103",
    //     database: "ecomm_db"
    // });
    
    // JAWDB MYSQL CONNECTION
    const conn = mysql.createConnection({
    	host: "l9dwvv6j64hlhpul.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    	port: 3306,
    	user: process.env.MYSQL_USER,
    	password: process.env.MYSQL_PASS,
    	database: "mvqa2ejzg5zltrc0"
    });

    // ATLAS MONGODB CONNECTION
    const MONGO_URL = process.env.MONGO_CONNECTION_STRING;

    const mOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    const mongoConn = MONGO_CLIENT.connect(MONGO_URL, mOptions);


	const log = function(err) {
		let content = `${(new Date).toUTCString()}: ${JSON.stringify(err)}` + "\n";
		fs.appendFile("./error_log.txt", content, function(err) {
			if(err){
				console.log(err);
			}
		});
		
		console.error(err);
	};
	
	const checkTable = (test, create) => {
		try {
			conn.query(test, function (err) {
				if (err) {
					conn.query(create, function (err) {
						if (err) {
							log(err);
						} else {
							console.log("Mysql database is initialized and ready");
						}
					});
				} else {
					console.log("Connection to database is successful!");
				}
			});
		} catch (error) {
			log(error);
		}
	}

	const userTableExist = () => {
		const queryCreate = "CREATE TABLE users (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, uID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, telcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL, verification_status BOOLEAN) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
		const queryTest = "SELECT * FROM users LIMIT 1";
		checkTable(queryTest, queryCreate);
    };

	const categoryTableExist = () => {
		const queryCreate = "CREATE TABLE categories (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, image VARCHAR(255) NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
		const queryTest = "SELECT * FROM categories LIMIT 1";
		checkTable(queryTest, queryCreate);
	};

	const vendorTableExist = () => {
		const queryCreate = "CREATE TABLE vendors (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, sellerID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, vendorName VARCHAR(255) NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
		const queryTest = "SELECT * FROM vendors LIMIT 1";
		checkTable(queryTest, queryCreate);
    };

    return {
        log,
        ePass,
        transporter,
        ObjectID,
        connection: conn,
        mongoConn,
        itemsDB: "globalDB",
        iCollection: "goods",
        userTableExist,
        categoryTableExist,
        vendorTableExist,
        sgMail
    };
};

module.exports = model();