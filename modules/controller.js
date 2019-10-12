const model = function() {
    const fs = require("fs");
    const mysql_config =  require("./config");
    const ph = require("./passwordHash");

    let global_username = "";
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
            global_username = "";
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
                if (ph.decrypt(user1.password) === user_password){
                    req.session.username = user_username;
                    global_username = req.session.username;
                    res.cookie("username", user_username);
                    res.redirect("/?idn=success");
                }
                // console.log(user1);
                res.end();
            }
        });
    };

    const register = function(req, res) {
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

        const uuid = genHex(32);
        const user_username = req.body.username;
        const user_password = req.body.password;
        const user_email = req.body.user_email;
        const user_fullname = req.body.fullname;

        let query = `INSERT INTO users (uID, username, password, fullname, telcode, phone, email, profile_picture) VALUES ('${uuid}', '${user_username}', '${ph.encrypt(user_password)}', '${user_fullname}', '+234', '09059620514', '${user_email}', '/assets/images/contacts-filled.png')`;
        
        mysql_config.connection.query(query, function(err, result){
            if(err) throw err;

            console.log('Inserted successfully!');
            req.session.username = user_username;
            global_username = req.session.username;
            res.cookie("username", user_username);
            res.redirect(`/?idn=success&generated_uuid=${ph.encrypt(uuid)}`);
        });
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
        search: search,
        data: function(req, res){
            const username = req.params.username;

            if(username === req.session.username){
                const query = `SELECT uID, fullname, username, phone, telcode, email, profile_picture FROM users WHERE username='${username}'`;
            
                mysql_config.connection.query(query, function(err, result){
                    if (err) throw err;
                    let [user] = result;
        
                    res.json(user);
                });
            }else{
                res.json({
                    email: "",
                    fullname: "",
                    phone: "",
                    profile_picture: "",
                    telcode: "",
                    uID: "",
                    username: ""
                });
            }
        }
    };
};

module.exports = model();