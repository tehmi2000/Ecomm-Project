CREATE TABLE users (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, uID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, telcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL, verification_status BOOLEAN) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
CREATE TABLE categories (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, image VARCHAR(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE vendors (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, sellerID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, vendorName VARCHAR(255) NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8;