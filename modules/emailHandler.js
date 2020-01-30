const model = function(){
	const request = require("request");
	const config = require("./config");
	
	const validation = async function(receiver, firstname, lastname, id){
		try{
			const options = { 
				method: 'POST',
				url: 'https://api.sendgrid.com/v3/mail/send',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
				},
				body: { 
					personalizations: [{
						to: [
								{
									email: receiver,
									name: `${firstname} ${lastname}`
								}
						],
						dynamic_template_data: {
							last_name: lastname,
							first_name: firstname,
							user_id: id,
							Sender_Name: "Univers",
							Sender_Address: "No. 14 Wale Erinle Str.",
							Sender_City: "Itoki-Ota Behind Gas Company",
							Sender_State: "Ogun State,  Nigeria"
						},
						subject: 'Welcome to Univers! Please confirm your registration to get started'
					}],
					from: { email: `${config.ePass['user']}`, name: 'Univers Team' },
					reply_to: { email: `${config.ePass['user']}`, name: 'Univers Team' },
					template_id: 'd-2d7ba831338f4ed6821fe281b03170e7'
				},
				json: true
			};
	
			request(options, function (error, response, body) {
				if (error) config.log(error);
				console.log({statusCode: response.statusCode, body: response.body}, body);
			});
		}catch(err){
			config.log("Verification Email sending error");
			config.log(err);
		}
	};

	const notification = async function(receiver){
	};


	const resetter = async function(receiver, firstname, lastname, id){
		const options = { 
			method: 'POST',
			url: 'https://api.sendgrid.com/v3/mail/send',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
			},
			body: { 
				personalizations: [{
					to: [
							{
								email: receiver,
								name: `${firstname} ${lastname}`
							}
					],
					dynamic_template_data: {
						last_name: lastname,
						first_name: firstname,
						user_id: id,
						Sender_Name: "Univers",
						Sender_Address: "No. 14 Wale Erinle Str.",
						Sender_City: "Itoki-Ota Behind Gas Company",
						Sender_State: "Ogun State,  Nigeria"
					},
					subject: 'Password Reset'
				}],
				from: { email: `${config.ePass['user']}`, name: 'Univers Team' },
				reply_to: { email: `${config.ePass['user']}`, name: 'Univers Team' },
				template_id: 'd-2d7ba831338f4ed6821fe281b03170e7'
			},
			json: true
		};

		request(options, function (error, response, body) {
			if (error) config.log(error);
			console.log({statusCode: response.statusCode});
		});
	};

	const supportAcknowledge = async function(receiver, firstname, lastname){
		const options = {
			method: 'POST',
			url: 'https://api.sendgrid.com/v3/mail/send',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
			},
			body: { 
				personalizations: [{
					to: [
							{
								email: receiver,
								name: `${firstname} ${lastname}`
							}
					],
					dynamic_template_data: {
						last_name: lastname,
						first_name: firstname,
						Sender_Name: "Univers",
						Sender_Address: "No. 14 Wale Erinle Str.",
						Sender_City: "Itoki-Ota Behind Gas Company",
						Sender_State: "Ogun State,  Nigeria"
					},
					subject: 'Univers Support: Request Acknowledgement'
				}],
				from: { email: `${config.ePass['user']}`, name: 'Univers Team' },
				reply_to: { email: `${config.ePass['user']}`, name: 'Univers Team' },
				template_id: 'd-29269701ba134385966ee25efab63fae'
			},
			json: true
		};

		request(options, function (error, response, body) {
			if (error) config.log(error);
			console.log({statusCode: response.statusCode});
		});
	};

	return {
		sendVerificationMail: validation,
		sendNotificationMail: notification,
		sendPasswordReset: resetter,
		sendAcknowledgeSupport: supportAcknowledge
	};
};

module.exports = model();