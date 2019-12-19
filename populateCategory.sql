CREATE TABLE categories (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, image VARCHAR(255) NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
INSERT INTO categories (title, image) VALUES ('Fashion', 'icofont-jacket');
INSERT INTO categories (title, image) VALUES ('Electronics', 'icofont-playstation-alt');
INSERT INTO categories (title, image) VALUES ('Beauty & Health Care', 'icofont-girl-alt');
INSERT INTO categories (title, image) VALUES ('Phones & Tablet', 'icofont-windows-lumia');
INSERT INTO categories (title, image) VALUES ('Baby, Kids & Toys', 'icofont-baby-trolley');
INSERT INTO categories (title, image) VALUES ('Groceries', 'icofont-broccoli');
INSERT INTO categories (title, image) VALUES ('Food Items And Drinks', 'icofont-fast-food');
INSERT INTO categories (title, image) VALUES ('Special Offer & Deals', 'icofont-gift');
INSERT INTO categories (title, image) VALUES ('Others', 'icofont-light-bulb');

-- DELETE FROM `categories` WHERE `categories`.`id` = 8