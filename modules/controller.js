const model = function() {
    const fs = require("fs");
    const mysql_config =  require("./config");
    const { log } = mysql_config;
    const ph = require("./passwordHash");

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

    const upload = function(req, res) {
        let file = req.files;
        let path = "./public/uploads";
        for (const key in file) {
            let uploadedFile = file[key];
            uploadedFile.mv(`${path}/${uploadedFile.name}`, function(err) {
                if (err) {
                    log(err);
                    res.json([{...err, status: 403}]);
                }else{
                    res.json([{status: 200, statusText: "Upload successful!"}]);
                }
            });
        }
    }

    const update = function(req, res) {
        const formatName = str => {
            let formattedString = (str.charAt(0)).toUpperCase()+(str.substring(1)).toLowerCase();
            return formattedString;
        };

        const user_username = req.body.username;
        const user_address = `${req.body.state}, ${req.body.country}`;
        const user_email = req.body.email;
        const user_firstname = formatName(req.body.firstname);
        const user_lastname = formatName(req.body.lastname);
        const user_phone = req.body.phone;
        const user_telcode = req.body.telcode;

        let query = `UPDATE users SET firstname='${user_firstname}', lastname='${user_lastname}', telcode='${user_telcode}', phone='${user_phone}', email='${user_email}', address='${user_address}' WHERE username='${user_username}'`;
        
        mysql_config.connection.query(query, function(err, result){
            if(err) {
                log(err);
            }else{
                console.log('User\'s account details updated successfully!');
                res.json(result);
            }
        });
    };

    const auth = function(req, res) {
        const user_username = req.body.username;
        const user_password = req.body.password;

        const query = `SELECT username, password FROM users WHERE username='${user_username}'`;
        mysql_config.connection.query(query, function(err, result){
            if(err) {
                log(err);
            }else{
                let [user1] = result;
                if (result.length === 0){
                    res.redirect(`/login?error=${ph.softEncrypt("not found")}&idn=novalid`);
                }else{
                    if (ph.decrypt(user1.password) === user_password){
                        req.session.username = user_username;
                        res.cookie("username", user_username);
                        res.redirect(`/?sess=${ph.softEncrypt("success")}&idn=success`);
                    }else{
                        res.redirect(`/login?error=${ph.softEncrypt("not found")}&idn=invalidid`);
                    }
                }
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

        mysql_config.connection.query(query, function(err, existing_users) {
            if(err){
                log(err);
            }else if(existing_users.length === 0){
                let query = `INSERT INTO users (uID, username, password, firstname, lastname, telcode, phone, email, address, profile_picture, verification_status) VALUES ('${uuid}', '${user_username}', '${ph.encrypt(user_password)}', '${user_firstname}', '${user_lastname}', '', '', '${user_email}', '', '/assets/images/contacts-filled.png', false)`;

                mysql_config.connection.query(query, function(err){

                    if(err) {
                        log(err);
                    }else{
                        console.log('Inserted successfully!');
                        require("./emailHandler").sendVerificationMail(user_email);
                        req.session.username = user_username;
                        res.cookie("username", user_username);
                        res.redirect(`/verification.html?idn=success&generated_uuid=${ph.softEncrypt(uuid)}`);
                    }
                });

            }else{
                res.redirect(`/signup?error=${ph.softEncrypt("not found")}&idn=userexist`);
            }
        });
    };

    return {
        auth,
        register,
        update,
        upload,
        resetHandler: function(req, res) {
            const account_email = req.body["reset-email"];
            console.log(account_email);

            const query = `SELECT email FROM users WHERE email='${account_email}'`;
            mysql_config.connection.query(query, function(err, result){
                if(err) {
                    log(err);
                }else{
                    let [user] = result;

                    if (result.length === 0){
                        res.redirect(`/passwordReset?error=${ph.softEncrypt("not found")}&idn=novalid`);
                    }else{
                        console.log(req.body);
                        res.end("Password Reset!");
                    }
                }
            });
        },
        dashboard: function(req, res) {
            readFile("./public/index.html", req, res);
        },
        search: function(req, res) {
            readFile("./public/search.html", req, res);
        },
        myprofile: function(req, res) {
            readFile("./public/profile.html", req, res);
        },
        control: function(req, res) {
            readFile("./public/control.html", req, res);
        },
        productView: function(req, res) {
            res.redirect(`/productView.html?queryItem=${req.params.itemID}`);
        },
        vendorApplication: function(req, res) {
            readFile("./public/vendorApplyForm.html", req, res);
        },
        login: function(req, res) {
            readFile("./public/login.html", req, res);
        },
        signup: function(req, res) {
            readFile("./public/signup.html", req, res);
        },
        reset: function(req, res) {
            readFile("./public/reset.html", req, res);
        },
        logout: function(req, res) {
            req.session.destroy(function (err) {
                if (err) {
                    log(err);
                } else {
                    res.clearCookie("username");
                    res.redirect("/login");
                }
            });
        }
    };
};

module.exports = model();