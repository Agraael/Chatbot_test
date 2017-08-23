var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://kraken:<ns9r^fm@cluster0-shard-00-00-iw9xa.mongodb.net:27017,cluster0-shard-00-01-iw9xa.mongodb.net:27017,cluster0-shard-00-02-iw9xa.mongodb.net:27017/Pc_Db?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
MongoClient.connect(uri, function(err, db) {
	// Paste the following examples here
	db.collection('inventory').insertMany([
		// MongoDB adds the _id field with an ObjectId if _id is not present
		{
			link: "http://www.ldlc.com/fiche/PB00229851.html",
			price: 1329,
			tags: ["gaming", "mid_price"]
		}, {
			link: "http://www.ldlc.com/fiche/PB00234159.html",
			price: 1999,
			tags: ["gaming", "big_price"]
		}, {
			link: "http://www.ldlc.com/fiche/PB00214460.html",
			price: 699,
			tags: ["gaming", "low_price"]
		}, {
			link: "http://www.ldlc.com/fiche/PB00210189.html",
			price: 199,
			tags: ["internet", "low_price"]
		}, {
			link: "http://www.ldlc.com/fiche/PB00210056.html",
			price: 349,
			tags: ["internet", "mid_price"]
		}, {
			link: "http://www.ldlc.com/fiche/PB00232416.html",
			price: 749,
			tags: ["internet", "big_price"]
		}, {
			link: "http://www.ldlc.com/fiche/PB00230425.html",
			price: 1099,
			tags: ["office", "low_price"]
		}, {
			link: "http://www.ldlc.com/fiche/PB00229519.html",
			price: 1649,
			tags: ["office", "mid_price"]
		}, {
			link: "http://www.ldlc.com/fiche/PB00223793.html",
			price: 1498,
			tags: ["office", "big_price"]
		}

	]).then(function(result) {
		// process result
	});
	db.collection('inventory').find({
		tags: ['office', 'low_price']
	}).nextObject(function(err, item) {
		console.log(item.link);
	});
	db.close();
});
/*
 
 */