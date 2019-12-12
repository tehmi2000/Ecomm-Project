const model = function(){
	const fs = require("fs");
	const config = require("./config");
	const transporter = config.transporter;
	const mailOption = { sender: `'Univers Team' <${config.ePass['user']}>` };
	let email_template = "<b>Hey</b>";


	const validation = async function(receiver){
		try{
			fs.readFile("./modules/templates/account_verify.html", "utf8", function(err, content) {
				if (err) {
					config.log(err);
				}else{
					email_template = content;
				}
			});

			let deliveryReport = await transporter.sendMail({
				from: mailOption.sender,
				to: receiver,
				subject: "Welcome to Univers! Please confirm your registration to get started",
				text: "",
				html: email_template || "<h1>Hi</h1>"
			});

			console.log("Verification Email with messageID %s sent", deliveryReport.messageId);
			return deliveryReport;

		}catch(err){
			config.log("Verification Email sending error");
			config.log(err);
		}
	};

	const notification = async function(){};

	return {
		sendVerificationMail: validation,
		sendNotificationMail: notification
	};
};

module.exports = model();