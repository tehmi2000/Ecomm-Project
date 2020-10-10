const model = function() {
    const router = require("express").Router();
    const fs = require("fs");
    const { log, connection, mongoConn, itemsDB, iCollection, ObjectID, voucherCollection } =  require("../modules/config");

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

    router.post("/goods/upsert", function(req, res) {
        const nameOfField = req.body['name-of-field'];
        let value = null;
        let item = {};

        switch (req.body['type-of-field']) {
            case "array":
                value = [];
                break;
            
            case "object":
                value = {};
                break;

            case "text":
                value = req.body['value-of-field'];
                break;

            default:
                value = req.body['value-of-field'];
                break;
        }

        item[`${nameOfField}`] = value;

        console.log(item);

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
			
			collection.updateMany({"published": true}, {$set: item}, {upsert: true}, function(err, result) {
				if(err) log(err);
				res.end(JSON.stringify(result));
			});
			
        }).catch(error => {
            log(error);
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

    router.get("/vendors/:id", function(req, res) {
        const searchStr = sqlSanitizer(req.params.id);
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

        if(username === req.session["univers-username"]){
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
        const publishedFlag = req.query['publishedFlag'];
        const sqlQuery = `SELECT sellerID FROM vendors WHERE username='${sqlSanitizer(req.params.username)}'`;

        connection.query(sqlQuery, function(err, result) {
            if (err) {
                log(err);

            }else if(result.length > 0){

                mongoConn.then(client => {
                    const [dataOne] = result;
                    const sellerID = dataOne.sellerID;
                    const collection = client.db(itemsDB).collection(iCollection);

                    const mongoQuery = (publishedFlag)? {$and: [{"published": true}, {"sellerID" : sellerID}]} : {"sellerID" : sellerID};
                    collection.find(mongoQuery).sort({postTime: -1}).toArray(function(err, docs) {
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
                    // console.log(item);
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
            collection.find({"published": true}).sort({"numberOfSaves": -1, "postTime": -1 }).limit(100).toArray(function(err, docs) {
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

    router.get("/goods/all/recommended", function(req, res) {
        console.log("Requesting recommended items...")
        const query = req.query['query'];

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.find({"published": true}).sort({"postTime": -1 }).limit(100).toArray(function(err, docs) {
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
        // const uploadPath = `https://s3.amazonaws.com/oneunivers-2-amazons3-bucket/uploads`;
        const uploadPath = `https://res.cloudinary.com/https-oneunivers-herokuapp-com/image/upload/univers_product_images`;
        const userInput = req.body;
        userInput.postTime = Date.now();
        userInput.numberOfSaves = 0;
        userInput.published = true;

        userInput[`item-image`] = userInput[`item-image`].map((imageUrl, index) => {
            console.log(index, imageUrl);
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

    router.post("/goods/save/:username/deleteFromStore", function(req, res) {
        const username = sqlSanitizer(formatName(req.params.username));
        const {itemID} = req.body;
        

        const query = `SELECT sellerID FROM vendors WHERE username='${username}'`;
            
        connection.query(query, function(err, result){
            if (err) {
                log(err);

            }else if (result.length > 0){
                let [user] = result;

                mongoConn.then(client => {
                    const collection = client.db(itemsDB).collection(iCollection);
                    
                    collection.deleteMany({$and: [{"sellerID": user.sellerID}, {"_id": ObjectID(itemID)}]}, function(err, result) {
                        if(err) {
                            log(err);
                        }else{
                            res.json(result);
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

        // Insert document into my saved items DB
        mongoConn.then(client => {
            const collection = client.db(username).collection("savedItems");

            collection.updateMany({"_id": item["_id"]}, {$set: item}, {upsert: true}, function(err, result) {
                if(err) {
                    log(err);
                }               
            });

        }).catch(error => {
            log(error);
        });

        // Update saved count on parent document
        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);

            collection.updateOne({"_id": ObjectID(item["_id"])}, {$inc: {"numberOfSaves": 1}}, function(err, result) {
                if(err) {
                    log(err);
                }else{
                    res.json(result);
                }
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


    router.post("/vouchers/:username/confirmVoucher", function(req, res) {
        const username = formatName(req.params.username);
        const { voucherName } = req.body;

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(voucherCollection);
            // const mongoQuery = {$and: [{"voucherName": voucherName}, {"validity": true}]};
            const mongoQuery = {"voucherName": voucherName};

			collection.findOne(mongoQuery).then(voucher => {
                let formattedVoucher = voucher;
                formattedVoucher.isValid = Date.now() < formattedVoucher.expiryDate;
                console.log(formattedVoucher);
                res.json(formattedVoucher);
			}).catch(error => {
                log(error);
            });
			
        }).catch(error => {
            log(error);
        });
    });

    router.post("/vouchers/:username/redeemVoucher", function(req, res) {

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