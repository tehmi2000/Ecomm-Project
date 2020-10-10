const model = function() {
    const router = require("express").Router();
    const fs = require("fs");
    const request = require("request");
    const crypto = require("crypto");

    const secret = process.env.PAYSTACK_SECRET_KEY;
    const { log } =  require("../modules/config");

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

    // <<<<<<<<<<<<<<<<<<<<<<<<<<<< ROUTES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    router.post("/webhook", function(req, res) {
        let whitelistIP = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];
        //validate event
        let hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        if (hash == req.headers['x-paystack-signature']) {
            // Retrieve the request's body
            var event = req.body;
            // Do something with event  
        }
        res.send(200);
    });

    return router;
};

module.exports = model();