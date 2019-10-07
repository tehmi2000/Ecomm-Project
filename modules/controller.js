const model = function() {
    const fs = require("fs");
    const mysql_config =  require("./config");

    const readFile = function(path, req, res) {
        fs.readFile(path, "utf8", function(err, content) {
            if (err) {
                throw err;
            } else {
                res.end(content);
            }
        });
    };

    const dashboard = function(req, res) {
        readFile("./public/index.html", req, res);
    };

    const myprofile = function(req, res) {
        readFile("./public/profile.html", req, res);
    };

    const login = function(req, res) {
        readFile("./public/login.html", req, res);
    };

    const signup = function(req, res) {
        readFile("./public/signup.html", req, res);
    };

    const logout = function(req, res) {

        req.session.destroy(function(err) {
            if (err) throw err;
            res.clearCookie("username");
            res.redirect("/login");
        });

    };

    const auth = function(req, res) {
        const user_username = req.body.username;
        const user_password = req.body.password;

        console.log();

        const query = `SELECT username, password FROM users WHERE username='${user_username}'`;
        mysql_config.connection.query(query, function(err, result){
            if (err) throw err;
            let [user1] = result;

            if (result.length === 0){
                res.redirect("/login?idn=novalid");
            }else{
                if (user1.password === user_password){
                    req.session.username = user_username;
                    res.cookie("username", user_username);
                    res.redirect("/?idn=success");
                }
                console.log(user1);
                res.end();
            }
        });
    };

    const register = function(req, res) {
        const user_username = req.body.username;
        const user_password = req.body.password;

        const createAccount = function() {
            
        };

        req.session.username = "temi";
        res.end();
    };

    const search = function(req, res) {
        readFile("./public/search.html", req, res);
    };

    return {
        dashboard: dashboard,
        myprofile: myprofile,
        login: login,
        signup: signup,
        logout: logout,
        auth: auth,
        register: register,
        search: search
    };
};

module.exports = model();