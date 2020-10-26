const model = function() {
    const router = require("express").Router();
    const fs = require("fs");

    const readFile = function(path, req, res) {
        fs.readFile(path, "utf8", function(err, content) {
            if (err) {
                throw err;
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.end(content);
            }
        });
    };

    router.get("/view", function(req, res) {
        readFile("./public/categoryView.html", req, res);
    });

    router.get("/all", function(req, res) {
        res.redirect("/categories");
    });

    return router;
};

module.exports = model();
