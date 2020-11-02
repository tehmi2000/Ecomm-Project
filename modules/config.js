const model = function(){

    const fs = require("fs");
    const mysql = require("mysql");
    const request = require("request");
    const MONGO_CLIENT = require("mongodb").MongoClient;
    const ObjectID = require("mongodb").ObjectId;
    const mailer = require("nodemailer");
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const ePass = {user: process.env.EMAIL_USERNAME};

    Object.defineProperty(ePass, "pass", {
        value: process.env.EMAIL_PASS,
        writable: true,
        configurable: true,
        enumerable: true
    });

    const transporter = mailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: ePass['user'],
            pass: ePass['pass']
        }
    });

    const itemsDB = "globalDB";
    const iCollection = "goods";
    const currencyRateDB = "globalDB";
    const ratesCollection = "ratesCollection";
    const voucherCollection = "vouchers";

    // const queryCreate = "CREATE TABLE users (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, uID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, telcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL, verification_status BOOLEAN) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
    // const queryTest = "SELECT * FROM users LIMIT 1";

    // LOCALHOST CONNECTION
    // const conn = mysql.createConnection({
    //     host: 'localhost',
    //     port: 3306,
    //     user: 'root',
   	//     password: '',
    //     database: "ecomm_db"
    // });
    
    // const MONGO_URL = "mongodb://localhost:27017";
    
    // JAWDB MYSQL CONNECTION
    const conn = mysql.createConnection({
    	host: "l9dwvv6j64hlhpul.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    	port: 3306,
    	user: process.env.MYSQL_USER,
    	password: process.env.MYSQL_PASS,
    	database: "mvqa2ejzg5zltrc0"
    });
    
    // ATLAS MONGODB CONNECTION
    const MONGO_URL = process.env.MONGO_CONNECTION_STRING;

    const mOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    const mongoConn = MONGO_CLIENT.connect(MONGO_URL, mOptions);

    let dateOftheMonth = new Date().getDate();
    let monthOfTheYear = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let fullDate = `${dateOftheMonth}-${monthOfTheYear}-${year}`;

    let lastCurrencyData = { 
        USDAED: 3.67296,
        USDAFN: 76.780574,
        USDALL: 105.242631,
        USDAMD: 489.65048,
        USDANG: 1.795321,
        USDAOA: 644.127003,
        USDARS: 77.143702,
        USDAUD: 1.386399,
        USDAWG: 1.8,
        USDAZN: 1.67226,
        USDBAM: 1.658249,
        USDBBD: 2.019492,
        USDBDT: 84.809045,
        USDBGN: 1.657914,
        USDBHD: 0.377128,
        USDBIF: 1934.113637,
        USDBMD: 1,
        USDBND: 1.35731,
        USDBOB: 6.911184,
        USDBRL: 5.5319,
        USDBSD: 1.000208,
        USDBTC: 0.000086460107,
        USDBTN: 73.320107,
        USDBWP: 11.469874,
        USDBYN: 2.570487,
        USDBYR: 19600,
        USDBZD: 2.016016,
        USDCAD: 1.311255,
        USDCDF: 1815.499532,
        USDCHF: 0.909403,
        USDCLF: 0.028884,
        USDCLP: 797.000112,
        USDCNY: 6.746099,
        USDCOP: 3833.59,
        USDCRC: 601.71859,
        USDCUC: 1,
        USDCUP: 26.5,
        USDCVE: 93.480565,
        USDCZK: 23.026103,
        USDDJF: 178.042474,
        USDDKK: 6.30266,
        USDDOP: 58.380354,
        USDDZD: 128.732547,
        USDEGP: 15.690619,
        USDERN: 14.999512,
        USDETB: 37.276673,
        USDEUR: 0.846755,
        USDFJD: 2.11335,
        USDFKP: 0.76558,
        USDGBP: 0.765704,
        USDGEL: 3.204991,
        USDGGP: 0.76558,
        USDGHS: 5.793057,
        USDGIP: 0.76558,
        USDGMD: 51.760309,
        USDGNF: 9797.889025,
        USDGTQ: 7.781391,
        USDGYD: 209.164402,
        USDHKD: 7.75025,
        USDHNL: 24.618998,
        USDHRK: 6.412008,
        USDHTG: 63.011306,
        USDHUF: 302.874991,
        USDIDR: 14754.8,
        USDILS: 3.38456,
        USDIMP: 0.76558,
        USDINR: 73.367601,
        USDIQD: 1194.017576,
        USDIRR: 42105.00027,
        USDISK: 138.020273,
        USDJEP: 0.76558,
        USDJMD: 144.525226,
        USDJOD: 0.708992,
        USDJPY: 105.338996,
        USDKES: 108.497023,
        USDKGS: 79.616695,
        USDKHR: 4104.65762,
        USDKMF: 416.492558,
        USDKPW: 900.03416,
        USDKRW: 1148.645001,
        USDKWD: 0.30596,
        USDKYD: 0.833521,
        USDKZT: 428.058484,
        USDLAK: 9229.523555,
        USDLBP: 1512.465397,
        USDLKR: 184.2805,
        USDLRD: 198.295202,
        USDLSL: 16.460286,
        USDLTL: 2.95274,
        USDLVL: 0.604891,
        USDLYD: 1.364444,
        USDMAD: 9.204845,
        USDMDL: 16.962775,
        USDMGA: 3894.179939,
        USDMKD: 52.236022,
        USDMMK: 1281.712217,
        USDMNT: 2859.271036,
        USDMOP: 7.984128,
        USDMRO: 357.000346,
        USDMUR: 39.789851,
        USDMVR: 15.409758,
        USDMWK: 753.236029,
        USDMXN: 21.197997,
        USDMYR: 4.146015,
        USDMZN: 72.644987,
        USDNAD: 16.549922,
        USDNGN: 383.540004,
        USDNIO: 34.836429,
        USDNOK: 9.144703,
        USDNPR: 117.31251,
        USDNZD: 1.503715,
        USDOMR: 0.384978,
        USDPAB: 1.000208,
        USDPEN: 3.580606,
        USDPGK: 3.499468,
        USDPHP: 48.620005,
        USDPKR: 163.827074,
        USDPLN: 3.78382,
        USDPYG: 7006.286802,
        USDQAR: 3.640974,
        USDRON: 4.125899,
        USDRSD: 99.560539,
        USDRUB: 77.066699,
        USDRWF: 977.264923,
        USDSAR: 3.751197,
        USDSBD: 8.133441,
        USDSCR: 18.105383,
        USDSDG: 55.275018,
        USDSEK: 8.80233,
        USDSGD: 1.35684,
        USDSHP: 0.76558,
        USDSLL: 9875.00049,
        USDSOS: 582.999689,
        USDSRD: 14.154005,
        USDSTD: 21033.812032,
        USDSVC: 8.7515,
        USDSYP: 512.246182,
        USDSZL: 16.542895,
        USDTHB: 31.159906,
        USDTJS: 10.321714,
        USDTMT: 3.5,
        USDTND: 2.752501,
        USDTOP: 2.3069,
        USDTRY: 7.877196,
        USDTTD: 6.764141,
        USDTWD: 28.628011,
        USDTZS: 2320.401974,
        USDUAH: 28.278414,
        USDUGX: 3703.659741,
        USDUSD: 1,
        USDUYU: 42.582379,
        USDUZS: 10351.964732,
        USDVEF: 9.987498,
        USDVND: 23178.5,
        USDVUV: 113.156872,
        USDWST: 2.621056,
        USDXAF: 556.147915,
        USDXAG: 0.039659,
        USDXAU: 0.00052,
        USDXCD: 2.70255,
        USDXDR: 0.707015,
        USDXOF: 556.107838,
        USDXPF: 101.350106,
        USDYER: 250.350078,
        USDZAR: 16.50847,
        USDZMK: 9001.19855,
        USDZMW: 20.09852,
        USDZWL: 322.000331
    };

	const log = function(err) {
		let content = `${(new Date).toUTCString()}: ${JSON.stringify(err)}` + "\n";
		fs.appendFile("./stderr.log", content, function(err) {
			if(err){
				console.log(err);
			}
		});
		
		console.error(err);
    };
    
    const logCurrencyRate = function (rates) {
        let content = JSON.stringify(rates);
		fs.writeFile("./router/support/currencies.json", content, function(err) {
			if(err){
				log(err);
			}
		});
    };
	
	const checkTable = (test, create) => {
		try {
			conn.query(test, function (err) {
				if (err) {
					conn.query(create, function (err) {
						if (err) {
							log(err);
						} else {
							console.log("Mysql database is initialized and ready");
						}
					});
				} else {
					console.log("Connection to database is successful!");
				}
			});
		} catch (error) {
			log(error);
		}
	}

	const userTableExist = () => {
		const queryCreate = "CREATE TABLE users (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, uID VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, telcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL, verification_status BOOLEAN) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
		const queryTest = "SELECT * FROM users LIMIT 1";
		checkTable(queryTest, queryCreate);
    };

	const categoryTableExist = () => {
		const queryCreate = "CREATE TABLE categories (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, image VARCHAR(255) NOT NULL, info TEXT NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
		const queryTest = "SELECT * FROM categories LIMIT 1";
		checkTable(queryTest, queryCreate);
	};

	const vendorTableExist = () => {
		const queryCreate = "CREATE TABLE vendors (id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, sellerID VARCHAR(100) NOT NULL, bio TEXT NOT NULL, email VARCHAR(255) NOT NULL, website VARCHAR(255) NOT NULL, vendorName VARCHAR(255) NOT NULL, country VARCHAR(255) NOT NULL, region VARCHAR(255) NOT NULL) ENGINE=InnoDB  DEFAULT CHARSET=utf8";
		const queryTest = "SELECT * FROM vendors LIMIT 1";
		checkTable(queryTest, queryCreate);
    };

    const updateExchangeRates = async function (){
        let data = null;
                                            
        const options = { 
            method: 'GET',
            url: 'http://api.currencylayer.com/live?access_key=f7e53ecd549591632e03a70c83591cfe&format=1',
            headers: {
                'content-type': 'application/json'
            },
            json: true
        };

        mongoConn.then(client => {
            // Get current exchange rates...
            request(options, function (error, response) {
                if (error) log(error);

                if(response){
                    if(response.statusCode >= 200 && response.statusCode < 400){
                        lastCurrencyData = response.body['quotes'];
                        data = Object.assign({}, {id: "ratesdata", lastModified: fullDate}, response.body['quotes']);
                    }
                }else{
                    data = Object.assign({}, {id: "ratesdata", lastModified: fullDate}, lastCurrencyData);
                    // console.log(data);
                }

                let collection = client.db(currencyRateDB).collection(ratesCollection);
                collection.updateOne({id: "ratesdata"}, {$set: data}, (err, {result}) => {
                    if (err) log(err);
                    console.log(result);
                });

                // Just for manual use and debugging...
                logCurrencyRate(data);
            });
        
        }).catch(error => {
            log(error);
        });
    };

    const insertExchangeRates = async function (){
        let data = null;
                                            
        const options = { 
            method: 'GET',
            url: 'http://api.currencylayer.com/live?access_key=f7e53ecd549591632e03a70c83591cfe&format=1',
            headers: {
                'content-type': 'application/json'
            },
            json: true
        };

        mongoConn.then(client => {
            // Get current exchange rates...
            request(options, function (error, response) {
                if (error) log(error);

                if(response){
                    if(response.statusCode >= 200 && response.statusCode < 400){
                        lastCurrencyData = response.body['quotes'];
                        data = Object.assign({}, {id: "ratesdata", lastModified: fullDate}, response.body['quotes']);
                    }

                }else{
                    data = Object.assign({}, {id: "ratesdata", lastModified: fullDate}, lastCurrencyData);
                    // console.log(data);
                }

                let collection = client.db(currencyRateDB).collection(ratesCollection);
                collection.insertOne(data, {}, (err, {result}) => {
                    if (err) log(err);
                    console.log(result);
                });

                // Just for manual use and debugging...
                logCurrencyRate(data);
            });
        
        }).catch(error => {
            log(error);
        });
    };

    return {
        log,
        ePass,
        transporter,
        ObjectID,
        connection: conn,
        mongoConn,
        itemsDB,
        iCollection,
        currencyRateDB,
        ratesCollection,
        voucherCollection,
        fullDate,
        userTableExist,
        categoryTableExist,
        vendorTableExist,
        updateExchangeRates,
        insertExchangeRates,
        sgMail
    };
};

module.exports = model();