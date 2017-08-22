var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
const apiaiApp = require('apiai')("e6cf31a0e6a3440c81b4e7bda0d67442");



app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}));

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function(req, res) {
	res.send('Hello world, I am a chat bot')
});

// for Facebook verification
app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === 'this_is_my_token') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
});

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});

app.post('/webhook/', function(req, res) {
	messaging_events = req.body.entry[0].messaging

	for (i = 0; i < messaging_events.length; i++) {
		event = req.body.entry[0].messaging[i]
		sender = event.sender.id
		if (event.message && event.message.text) {
			console.log("message reçu -> " + event.message.text);
			sendToAi(event);
			//     text = event.message.text
			//     if (text === 'Generic') {
			// 	sendGenericMessage(sender)
			// 	continue
			//     }
			//     sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
			// }
			// if (event.postback) {
			//     text = JSON.stringify(event.postback)
			//     sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			//     continue
		}
	}
	res.sendStatus(200)
})

var heroku_token = "EAAbaupnhaZCwBAIgobay0MpBHY69qZAlmxd5JsFbCHQmX6gBHQKgX40287ov6stg6E0vLln7WsiZC3wlPHwZCYJgZCTtOcHCNaHLMQTQmhpOcpaMXQLSTZAZCOeUykWJaIqtfLIXtbt0phVoFel2T4Tj8i4lhdLliJQWWYHkNxEzwZDZD"

function sendTextMessage(sender, text) {
	messageData = {
		text: text
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: heroku_token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: heroku_token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendToAi(event) {
	let sender = event.sender.id;
	let text = event.message.text;

	let apiai = apiaiApp.textRequest(text, {
		sessionId: 'tabby_cat' // use any arbitrary id

	});

	apiai.on('response', (response) => {
		// Got a response from api.ai. Let's POST to Facebook Messenger
		let aiText = response.result.fulfillment.speech;
		sendTextMessage(sender, aiText);
	});

	apiai.on('error', (error) => {
		console.log(error);

	});

	apiai.end();

}