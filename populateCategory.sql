CREATE TABLE categories (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, image VARCHAR(255) NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
INSERT INTO categories (title, image, info) VALUES ('Fashion & Accessories', 'icofont-jacket', 'Contains all kinds of fashionable wears such as shoes, dresses, shirts and a lot more');
INSERT INTO categories (title, image, info) VALUES ('Electronics', 'icofont-micro-chip', '');
INSERT INTO categories (title, image, info) VALUES ('Beauty & Health Care', 'icofont-girl-alt', '');
INSERT INTO categories (title, image, info) VALUES ('Phones & Tablet', 'icofont-windows-lumia', '');
INSERT INTO categories (title, image, info) VALUES ('Baby, Kids & Toys', 'icofont-baby-trolley', '');
INSERT INTO categories (title, image, info) VALUES ('Groceries', 'icofont-broccoli', '');
INSERT INTO categories (title, image, info) VALUES ('Food Items & Drinks', 'icofont-fast-food', '');
INSERT INTO categories (title, image, info) VALUES ('Special Offer & Deals', 'icofont-gift', '');
INSERT INTO categories (title, image, info) VALUES ('Others', 'icofont-light-bulb', '');

-- DELETE FROM `categories` WHERE `categories`.`id` = 8
-- ALTER TABLE `categories` ADD `info` TEXT NOT NULL AFTER `image`;
-- UPDATE `categories` SET `info` = 'Contains all kinds of fashionable wears such as shoes, dresses, shirts and a lot more' WHERE `categories`.`id` = 1;
-- UPDATE `categories` SET `info` = 'Contains all kinds of appliances, electronic devices and electrical components.' WHERE `categories`.`id` = 2;
-- UPDATE `categories` SET `info` = 'Only products on promotional offers and discounted products can be found in this category' WHERE `categories`.`id` = 8;