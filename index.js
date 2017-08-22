//
// index.js for chatbot_test in /home/kraken/Knowledge/Programming/Node.Js/chat_bot/test_bot_messenger
// 
// Made by Kraken
// Login   <cedric.cescutti@epitech.eu>
// 
// Started on  Sat Aug 12 11:27:42 2017 Kraken
// Last update Tue Aug 22 15:23:12 2017 Kraken
//

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var apiAi_token = "e6cf31a0e6a3440c81b4e7bda0d67442";
var facebook_token = 'my_voice_is_Pmy_password_verify_me';
var heroku_token = "EAAbaupnhaZCwBAIgobay0MpBHY69qZAlmxd5JsFbCHQmX6gBHQKgX40287ov6stg6E0vLln7WsiZC3wlPHwZCYJgZCTtOcHCNaHLMQTQmhpOcpaMXQLSTZAZCOeUykWJaIqtfLIXtbt0phVoFel2T4Tj8i4lhdLliJQWWYHkNxEzwZDZD";

var app = express();
var apiAiApp = require('apiai')(apiAi_token);

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(bodyParser.json());

app.get('/', (request, response) => {
	response.send('Hello, I am a chat bot');
});

// Facebook verification
app.get('/webhook', (request, response) => {
	if (request.query['hub.verify_token'] === facebook_token) {
		response.send(req.query['hub.challenge']);
	}
	response.send('Error, wrong token');
});

// server message
app.listen(app.get('port'), () => {
	console.log('running on port', app.get('port'));
});

// catch messenger responses -> send it to Api.ai
app.post('/webhook/', (request, response) => {
	messaging_events = request.body.entry[0].messaging;
	for (var i = 0; i < messaging_events.length; i++) {
		event = request.body.entry[0].messaging_events[i];
		sender = event.sender.id;
		if (event.message && event.message.text) {
			console.log("message reçu ->" + event.message.text);
			sendToAi(event);
		}
	}
	response.sendStatus(200);
});

function sendTextMessage(sender_id, text) {
	messageData = {
		text: text
	};
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: heroku_token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender_id
			},
			message: messageData,
		}
	}, (error, response, body) => {
		if (error) {
			console.log('Error sending messages: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		}
	});
}

function sendToAi(event) {
	let sender_id = event.sender.id;
	let text = event.message.text;
	let option = {
		sessionId: 'moumoute_bot'
	};

	let apiAi = apiAiApp.textRequest(text, option);

	apiAi.on('response', (response) => {
		let aiText = response.result.fulfill.speech;
		sendTextMessage(sender_id, aiText);
	});
	apiAi.on('error', (error) => {
		console.log(error);
	});
	apiAi.end();
}