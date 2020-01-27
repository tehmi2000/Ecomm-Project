const model = function() {
    const router = require("express").Router();
    const fs = require("fs");
    const { log, connection, mongoConn, itemsDB, iCollection, ObjectID } =  require("../modules/config");

    const sqlSanitizer = function(input) {

        return input.replace(/ /g, '')
                    .replace(/\'/g, '')
                    .replace(/\"/g, '')
                    .replace(/\`/g, '')
                    .replace(/--/g, '')
                    .replace(/=/g, '');
    };

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

    router.get("/vendors/:search", function(req, res) {
        const searchStr = sqlSanitizer(req.params.search);
        const sqlQuery = `SELECT * FROM vendors WHERE username='${searchStr}' OR sellerID='${searchStr}'`;

        connection.query(sqlQuery, function(err, result) {
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
        const username = sqlSanitizer(req.params.username);

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
            collection.find({"published": true}).toArray(function(err, docs) {
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
            collection.find({"published": true}).toArray(function(err, docs) {
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
            if (err) {
                log(err);

            }else if(result.length > 0){

                mongoConn.then(client => {
                    const [dataOne] = result;
                    const sellerID = dataOne.sellerID;
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
        
        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.find({$and: [{"published": true}, {"_id": ObjectID(itemID)}]}).toArray(function(err, item) {
                if(err) {
                    log(err);
                }else{
                    console.log(item);
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
        let pattern = query;
        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.find({$and:[{"published": true}, {$text: {$search: pattern}}]}).toArray(function(err, docs) {

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
            collection.find({"published": true}).sort({ numberOfSaves: -1 }).limit(100).toArray(function(err, docs) {
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

    router.post("/goods/save/:username/publish", function(req, res) {
        const username = formatName(req.params.username);
        const {itemID, state} = req.body;

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
			
			collection.updateOne({"_id": ObjectID(itemID)}, {$set: {"published": state}}, function(err, result) {
				if(err) log(err);
				res.json(result);
			});
			
        }).catch(error => {
            log(error);
        });

    });

    router.post("/goods/save", function(req, res) {
        const uploadPath = `https://s3.amazonaws.com/oneunivers-1-amazons3-bucket/uploads`;
        const userInput = req.body;
        userInput.postTime = Date.now();
        userInput.numberOfSaves = 0;
        userInput.published = true;

        userInput[`item-image`] = userInput[`item-image`].map((imageUrl, index) => {
            return (imageUrl !== '')? `${uploadPath}/${imageUrl}`: '';
        });
        console.log(userInput[`item-image`]);

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.insertOne(userInput, function(err, result) {
                if(err) {
                    log(err);
                    res.json([{...err}]);
                }else{
                    console.log("Saving...");
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
			
			collection.updateMany({"_id": item["_id"]}, {$set: item}, {upsert: true}, function(err, result) {
				if(err) log(err);
				res.json(result);
			});
			
        }).catch(error => {
            log(error);
        });
    });

    router.post("/goods/save/:username/removeFromCart", function(req, res) {

        const username = formatName(req.params.username);
        const {itemID} = req.body;

        mongoConn.then(client => {
            const collection = client.db(username).collection("myCart");
			
			collection.deleteMany({"_id": itemID}, function(err, result) {
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

            collection.updateMany({"_id": item["_id"]}, {$set: item}, {upsert: true}, function(err, result) {
                if(err) log(err);
                res.json(result);
            });
        }).catch(error => {
            log(error);
        });
    });

    router.post("/goods/save/:username/removeFromSaved", function(req, res) {

        const username = formatName(req.params.username);
        const {itemID} = req.body;

        mongoConn.then(client => {
            const collection = client.db(username).collection("savedItems");
			
			collection.deleteMany({"_id": itemID}, function(err, result) {
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