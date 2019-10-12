const model = function(){

    const mysql = require("mysql");
    const query_create = "CREATE TABLE users (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, uID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, fullname VARCHAR(255) NOT NULL, telcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
    const query_test = "SELECT * FROM users";
    
    return {
        connection: mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: "ecomm_db"
        }),

        MONGO_URL: "mongodb://localhost:27017",

        create: query_create,
        test: query_test
    };
};

module.exports = model();