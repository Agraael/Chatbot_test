//
// index.js for chatbot_test in /home/kraken/Knowledge/Programming/Node.Js/chat_bot/test_bot_messenger
// 
// Made by Kraken
// Login   <cedric.cescutti@epitech.eu>
// 
// Started on  Sat Aug 12 11:27:42 2017 Kraken
// Last update Wed Aug 23 02:02:26 2017 Kraken
//

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var dataBase;

var apiAi_token = "30dbfe4cfa4242e69f52ce4efacdf6f6";
var facebook_token = 'this_is_my_token';
var heroku_token = "EAAbaupnhaZCwBAIgobay0MpBHY69qZAlmxd5JsFbCHQmX6gBHQKgX40287ov6stg6E0vLln7WsiZC3wlPHwZCYJgZCTtOcHCNaHLMQTQmhpOcpaMXQLSTZAZCOeUykWJaIqtfLIXtbt0phVoFel2T4Tj8i4lhdLliJQWWYHkNxEzwZDZD";


var app = express();
var apiAiApp = require('apiai')(apiAi_token);

console.log("server start");
app.set('port', (process.env.PORT || 5000));

var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://kraken:<ns9r^fm@cluster0-shard-00-00-iw9xa.mongodb.net:27017,cluster0-shard-00-01-iw9xa.mongodb.net:27017,cluster0-shard-00-02-iw9xa.mongodb.net:27017/Pc_Db?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
MongoClient.connect(uri, function(err, db) {
	dataBase = db;
});

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
		console.log("Verified webhook");
		res.status(200).send(req.query["hub.challenge"]);
	} else {
		console.error("Verification failed. The tokens do not match.");
		res.sendStatus(403);
	}
});

// server message
app.listen(app.get('port'), () => {
	console.log('running on port', app.get('port'));
});

// catch messenger responses -> send it to Api.ai
app.post('/webhook/', (request, response) => {
	messaging_events = request.body.entry[0].messaging;

	for (i = 0; i < messaging_events.length; i++) {
		event = request.body.entry[0].messaging[i];
		sender = event.sender.id;
		console.log(sender);
		if (event.message && event.message.text) {
			console.log("message reçu -> " + event.message.text);
			console.log(sender);
			console.log(event);
			sendToAi(event);
		}
	}
	response.sendStatus(200);
});


function sendTextMessage(sender_id, text) {
	console.log("message responce -> " + text);
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

function getName(event) {
	let sender_id = event.sender.id;
	request({
		url: "https://graph.facebook.com/v2.6/" + sender_id,
		qs: {
			access_token: heroku_token,
			fields: 'first_name,last_name,'
		},
		method: "GET",

	}, (error, response, body) => {
		if (error) {
			console.log("error getting username");
		} else {
			var bodyObj = JSON.parse(body);
			firstName = bodyObj.first_name;
			lastName = bodyObj.last_name;
			sendTextMessage(sender_id, "Bonjour," + firstName + " " + lastName + ", je suis un bot créé par Jules et je vais vous trouver l\'ordinateur idéal.");
			sendTextMessage(sender_id, "Quelle en sera votre utilisation ? (bureautique, gaming, surf internet ...)");
		}
	});
}

function findPc(response, event) {
	let pcType = '';
	let pcPrice = 'mid_price';
	if (response.result.action === 'gaming_pc')
		pcType = 'gaming';
	if (response.result.action === 'internet_pc')
		pcType = 'internet';
	if (response.result.action === 'office_pc')
		pcType = 'office';
	if (response.result.parameters.low_price != '')
		pcPrice = 'low_price';
	if (response.result.parameters.big_price != '')
		pcPrice = 'big_price';
	console.log(pcType + " " + pcPrice);
	var cursor = dataBase.collection('inventory').find({
		tags: [pcPrice, pcType]
	});
	console.log(cursor);
}

function sendToAi(event) {
	let sender_id = event.sender.id;
	let text = event.message.text;
	let option = {
		sessionId: 'tabby_cat'
	};

	let apiAi = apiAiApp.textRequest(text, option);
	apiAi.on('response', (response) => {
		console.log(response);
		let action = response.result.action;
		if (action === 'input.welcome') {
			getName(event);
		} else if (action === 'gaming_pc' || action === 'office_pc' || action === 'internet_pc') {
			findPc(response, event);
		} else {
			let aiText = response.result.fulfillment.speech;
			sendTextMessage(sender_id, aiText);
		}
	});
	apiAi.on('error', (error) => {
		console.log(error);
	});
	apiAi.end();
}