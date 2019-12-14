const model = function(){
	const fs = require("fs");
	const config = require("./config");
	const transporter = config.transporter;
	const mailTransport = config.sgMail;
	const mailOption = { sender: `'Univers Team' <${config.ePass['user']}>` };
	let email_template = "<b>Hey</b>";

	const msg = {
		to: 'tehmi2000@gmail.com',
		from: "universone132@gmail.com",
		subject: "Sending is fun",
		text: '...and easy',
		html: '<strong>But crazy</strong>'
	};

	const emailSender = async function(msg) {
        try {
			let [result] = await mailTransport.send(msg);
			return result;
        } catch (error) {
            return error;
        }
	};

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

	const notification = async function(receiver){
	};

	return {
		sendVerificationMail: validation,
		sendNotificationMail: notification
	};
};

module.exports = model();