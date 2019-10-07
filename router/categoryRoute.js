const model = function() {
    const router = require("express").Router();
    const fs = require("fs");

    const readFile = function(path, req, res) {
        fs.readFile(path, "utf8", function(err, content) {
            if (err) {
                throw err;
            } else {
                res.end(content);
            }
        });
    };

    router.get("/", function(req, res) {
        readFile("./public/categories.html", req, res);
    });

    router.get("/all", function(req, res) {
        readFile("./public/categories.html", req, res);
    });

    router.get("/fashion", function(req, res) {
        readFile("./public/dummy.html", req, res);
    });

    return router;
};

module.exports = model();
