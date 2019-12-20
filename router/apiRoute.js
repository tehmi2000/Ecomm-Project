const model = function() {
    const router = require("express").Router();
    const fs = require("fs");
    const controller = require("../modules/controller");
    const { log, connection, mongoConn, itemsDB, iCollection, ObjectID } =  require("../modules/config");
    const ph = require("../modules/passwordHash");

    function forEach(elements, reaction){
        for(let i = 0; i < elements.length; i++){
            (reaction)(elements[i]);
        }
    }

    const readFile = function(path, req, res) {
        fs.readFile(path, "utf8", function(err, content) {
            if (err) {
                log(err);
            } else {
                res.end(content);
            }
        });
    };

    const formatName = function(str){
        let formattedString = (str.charAt(0)).toUpperCase()+(str.substring(1)).toLowerCase();
        return formattedString;
    };

    router.post("/auth", function(req, res) {
        const user_username = req.body.username;
        const user_password = req.body.password;

        const query = `SELECT username, password FROM users WHERE username='${user_username}'`;
        connection.query(query, function(err, result){
            if(err) {
                log(err);
            }else{
                let [user1] = result;
                if (result.length === 0){
                    res.json({
                        error: "",
                        state: null
                    });
                }else{
                    if (ph.decrypt(user1.password) === user_password){
                        req.session.username = user_username;
                        res.cookie("username", user_username);
                        res.json({
                            code: "",
                            state: ""
                        });
                    }else{
                        
                        res.json({
                            error: "",
                            state: null
                        });
                    }
                }
            }
        });
    });

    router.post("/register", function(req, res) {
        function genHex(length){
            length = length || 16;
            let counter = 0;
            let generated_hex = "t";
            let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            
            while(counter <= length){
                let rand_index = Math.round((Math.random()*characters.length)+1);
                generated_hex += characters.charAt(rand_index);
                counter += 1;
            }
            console.log(generated_hex);
            return generated_hex;
        }

        function formatName(str){
            let formattedString = (str.charAt(0)).toUpperCase()+(str.substring(1)).toLowerCase();
            console.log(formattedString);
            return formattedString;
        }

        const uuid = genHex(32);
        const user_username = req.body.username;
        const user_password = req.body.password;
        const user_email = req.body.user_email;
        const user_firstname = formatName(req.body.firstname);
        const user_lastname = formatName(req.body.lastname);

        let query = `SELECT username, email FROM users WHERE username="${user_username}" OR email="${user_email}"`;

        connection.query(query, function(err, existing_users) {
            if(err){
                console.log(err);
            }else if(existing_users.length === 0){
                let query = `INSERT INTO users (uID, username, password, firstname, lastname, telcode, phone, email, address, profile_picture, verification_status) VALUES ('${uuid}', '${user_username}', '${ph.encrypt(user_password)}', '${user_firstname}', '${user_lastname}', '', '', '${user_email}', '', '/assets/images/contacts-filled.png', true)`;

                connection.query(query, function(err){

                    if(err) {
                        log(err);
                    }else{
                        console.log('Inserted successfully!');
                        require("../modules/emailHandler").sendVerificationMail(user_email);
                        req.session.username = user_username;
                        res.cookie("username", user_username);
                        res.json({
                            code: "",
                            state: ""
                        });
                    }
                });

            }else{
                res.json({
                    error: "",
                    state: null
                });
            }
        });
    });

    router.get("/ads/all", function(req, res) {
    	const dirPath = `./public/assets/ads`;
    	fs.readdir(dirPath, (err, files) => {
    		if (err) {
    			throw err;
    		}else{
    			// console.log(files);
    			res.json(files);
    		}
    	});
    });

    router.get("/vendors/:username", function(req, res) {
        const sqlQuery = `SELECT * FROM vendors WHERE username='${req.params.username}'`;

        connection.query(sqlQuery, function(err, result) {
            console.log(result);
            if (err) {
                log(err);

            }else if(result.length > 0){
                res.json(result);
            }else{
                res.json([{
                    error: "NonVendorError",
                    code: 404,
                    message: "Not a vendor"
                }]);
            }
        });
    });

    router.get("/user/:username", function(req, res){
        const username = req.params.username;

        if(username === req.session.username){
            const query = `SELECT uID, firstname, lastname, username, phone, email, address, profile_picture FROM users WHERE username='${username}'`;
            connection.query(query, function(err, result){
                if (err) {
                    log(err);
                }else{
                    let [user] = result;
                    res.json(user);
                }
            });
        }else{
            res.json({
                email: "",
                firstname: "",
                lastname: "",
                phone: "",
                profile_picture: "",
                telcode: "",
                uID: "",
                username: ""
            });
        }
    });

    router.get("/user/:username/getSavedItems", function(req, res) {

        mongoConn.then(client => {
            const collection = client.db(`${formatName(req.params.username)}`).collection("savedItems");
            collection.find({}).toArray(function(err, docs) {
                if(err) {
                    log(err);
                }else{
                    res.json(docs);
                }
            });
        }).catch(error => {
            log(error);
        });
    });

    router.get("/user/:username/getCart", function(req, res) {

        mongoConn.then(client => {
            const collection = client.db(`${formatName(req.params.username)}`).collection("myCart");
            collection.find({}).toArray(function(err, docs) {
                if(err) {
                    log(err);
                }else{
                    res.json(docs);
                }
            });
        }).catch(error => {
            log(error);
        });
    });

    router.get("/user/:username/getStoreItems", function(req, res) {
        const query = req.query['query'];

        const sqlQuery = `SELECT sellerID FROM vendors WHERE username='${req.params.username}'`;

        connection.query(sqlQuery, function(err, result) {
            console.log(result);
            if (err) {
                log(err);

            }else if(result.length > 0){

                mongoConn.then(client => {
                    const [sellerID] = result;
                    const collection = client.db(itemsDB).collection(iCollection);

                    collection.find({"sellerID" : sellerID}).sort({postTime: -1}).toArray(function(err, docs) {
                        if(err) {
                            log(err);
                        }else{
                            res.json(docs);
                        }
                    });
                }).catch(error => {
                    log(error);
                });

            }else{
                res.json([{
                    error: "NonVendorError",
                    code: 404,
                    message: "Not a vendor"
                }]);
            }
        });
    });

    router.get("/goods/item-sizes", function(req, res) {
        fs.readFile("./router/support/product-sizes.json", "utf8", function(err, content) {
            if (err) {
                log(err);
            } else {
                res.json(JSON.parse(content));
            }
        });
    });

    router.get("/goods/:itemID", function(req, res) {
        const itemID = req.params.itemID;
        console.log(itemID);
        
        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.find({"_id" : ObjectID(itemID)}).toArray(function(err, item) {

                if(err) {
                    log(err);
                }else{
                    if(item.length > 0){
                        res.json(item);
                    }else{
                        res.json([{
                            error: "NotFoundError",
                            code: 404,
                            message: "Your item could not be found"
                        }]);
                    }
                }
            });

        }).catch(error => {
            log(error);
        });
    });

    router.get("/goods/all/search", function(req, res) {
        const query = req.query['query'];
        // console.log(query);
        
        let pattern = query;

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.createIndex({"item-name": "text"});
            collection.find({$text: {$search: pattern}}).toArray(function(err, docs) {

                if(err) {
                    log(err);
                }else{
                    res.json(docs);
                }
            });

        }).catch(error => {
            log(error);
        });
    });

    
    router.get("/goods/all/mostPopular", function(req, res) {
        const query = req.query['query'];

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.find({}).sort({ numberOfSaves: -1 }).limit(10).toArray(function(err, docs) {
                if(err) {
                    log(err);
                }else{
                    res.json(docs);
                }
            });
        }).catch(error => {
            log(error);
        });

    });

    router.post("/goods/save", function(req, res) {
        const uploadPath = `../uploads`;
        const userInput = req.body;
        userInput.postTime = Date.now();
        userInput.numberOfSaves = 0;
        userInput.published = false;


        userInput[`item-image`] = userInput[`item-image`].map((imageUrl, index) => {
            return (imageUrl !== '')? `${uploadPath}/${imageUrl}`: imageUrl;
        });
        console.log(userInput[`item-image`]);

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.insertOne(userInput, function(err, result) {
                if(err) {
                    log(err);
                    res.json([{...err}]);
                }else{
                    console.log("Saving...")
                    // res.redirect("/myprofile/orders?sectid=3");
                    res.json([{...result}]);
                }
            });
        }).catch(error => {
            log(error);
        });
    });

    router.post("/goods/save/:username/addToCart", function(req, res) {

        const username = formatName(req.params.username);
        const item = req.body.item;

        mongoConn.then(client => {
            const collection = client.db(username).collection("myCart");
			
			collection.updateMany({"_id": item["_id"]}, {$set: JSON.stringify(item)}, {upsert: true}, function(err, result) {
				if(err) log(err);
				res.json(result);
			});
			
        }).catch(error => {
            log(error);
        });

    });

    router.post("/goods/save/:username/addToSavedItems", function(req, res) {
        const username = formatName(req.params.username);
        const item = req.body.item;

        mongoConn.then(client => {
            const collection = client.db(username).collection("savedItems");

            collection.updateMany({"_id": item["_id"]}, {$set: JSON.stringify(item)}, {upsert: true}, function(err, result) {
                if(err) log(err);
                res.json(result);
            });
        }).catch(error => {
            log(error);
        });
    });

    router.get("/categories", function(req, res) {
        const query = `SELECT * FROM categories WHERE 1`;
            
        connection.query(query, function(err, result){
            if (err) {
                log(err);
            }else{
                res.json(result);
            }
        });
    });

    router.get("/countries/all", function(req, res) {
        fs.readFile("./router/support/countries.json", "utf8", function(err, content) {
            if (err) {
                log(err);
            } else {
                res.json(JSON.parse(content));
            }
        });
    });

    router.get("/countries/all/:name/getRegions", function(req, res) {

        const countryName = req.params.name;

        const getFilename = function(countryList) {
            let value = null;

            forEach(countryList, countryObject => {
                if(countryObject.name == countryName && countryObject.filename !== undefined){
                    value = countryObject.filename;
                }
            });

            return value;
        };

        fs.readFile("./router/support/countries.json", "utf8", function(err, content) {
            if (err) {
                log(err);
            } else {
                const countryList = JSON.parse(content);
                let filename = getFilename(countryList);

                if(filename !== null){
                    fs.readFile(`./router/support/countries/${filename}.json`, "utf8", function(err, content) {
                        if (err) {
                            log(err);
                        } else {
                            res.json(JSON.parse(content));
                        }
                    });
                }else{
                    res.json([]);
                }
            }
        });
    });

    return router;
};

module.exports = model();