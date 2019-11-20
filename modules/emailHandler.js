const model = function(){
	const fs = require("fs");
	const config = require("./config");
	const transporter = config.transporter;
	const mailOption = { sender: '"Ecommerce Support" <' + config.ePass['user']+'>' };
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
				subject: "Verify your account",
				text: "",
				html: "<h1>hey</h1>"
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