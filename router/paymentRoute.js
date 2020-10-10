const model = function() {
    const router = require("express").Router();
    const fs = require("fs");
    const request = require("request");
    const { log, connection, mongoConn, itemsDB, iCollection, ObjectID, voucherCollection } =  require("../modules/config");

    const sqlSanitizer = input => {
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

    router.get("/", function(req, res) {
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/bank/resolve?accountnumber=0001234567&bankcode=058",
            method: "GET",
            headers: {
                Authorization: `Bearer SECRETKEY`
            }
        };

		request(options).then(async response => {
            console.log({statusCode: response.statusCode});
            
		}).catch(error => {
            log(error);
        });

        res.json({});
        
    });

    return router;
};

module.exports = model();