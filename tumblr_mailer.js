/*
*
*here is the json of my blog (GET request with someone else's API key)
*https://api.tumblr.com/v2/blog/js-on-js.tumblr.com/posts/text?api_key=fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4
*MORE DOCUMENTATION HERE: https://www.tumblr.com/docs/en/api/v2
*
*/

//references:
var fs = require("fs");
var ejs = require("ejs");
var tumblr = require('tumblr.js');
var secrets = require('./secrets.js');

//access secrets.js
var client = tumblr.createClient(secrets.TUMBLR_CONFIG);

var trigger = function() {
	//do everything here with callbacks (call a function from within a function from within a function...)
	console.log("STARTING...");
	//1. call to tumblr and retreive posts, then customize template, then send them 
	//(so nested! need to work with events!)
	getTumblrPosts(createCustomizedEmails);
}

trigger();



function createCustomizedEmails(postsArray, callback) {
	postsArray.forEach(function(p, index) {
		console.log("looking at post #" + index);
		for(var prop in p) {
			console.log(prop + ": " + p[prop]);
		}
	});

	//Read CSV file with Contacts:
	var csvFile = fs.readFileSync("./data/friend_list.csv","utf8");
	console.log(csvFile);

	//Parse Contacts in contacts[]:
	var contacts = csvParse(csvFile);

	//Loop through contacts[] to customize email ejs
	var emailTemplate = fs.readFileSync("views/email_template.ejs").toString();	//toString is important!
	contacts.forEach(function(c){
		console.log(c.firstName + ": " + c.numMonthsSinceContact + '\n');
		var moreData = {};
		moreData.firstName = c.firstName;
		moreData.numMonthsSinceContact = c.numMonthsSinceContact;
		//todo: add recent blog posts
		moreData.latestPosts = postsArray;

		//var customizedTemplate = ejs.render(emailTemplate, {firstName: "Jonatan", numMonthsSinceContact: "5"});
		var customizedTemplate = ejs.render(emailTemplate, moreData);
		console.log(customizedTemplate);
	});

}


function getTumblrPosts(callback) {
	var blogName = "js-on-js";
 	var maxPostAge = 7;
 	var arrNewPosts = [];
	client.posts(blogName, function(err, blog){

		console.log("num posts: " + blog.posts.length);
		for(var post in blog.posts) {
		  	//calculate post age:
		  	var today = new Date();
		  	var postDate = new Date(blog.posts[post].date);
		  	var postAge = Math.ceil((today - postDate) / (1000 * 3600 * 24));
		  	//console.log("Post Age: " + today + "-" + postDate + " = " + postAge);
		  	if(Number(postAge) <= Number(maxPostAge)) {
		  		var p = {
		  			"date": blog.posts[post].date,
		  			"title" : blog.posts[post].title,
		  			"url" : blog.posts[post].post_url
		  		}
	  		
	  			arrNewPosts.push(p);
	  		}
		}
		console.log("return array sizeTWO: " + arrNewPosts.length);

		//THIS IS THE TRICK: RETURN ARRAY FROM HERE	  
		console.log	("\n\n\nreturning Array with " + arrNewPosts.length + " post(s)\n\n\n");
		callback(arrNewPosts);
		return arrNewPosts;
	});
}



function csvParse(csvFile) {
	var arrContacts = [];
	var csvArray = csvFile.split("\n");
	console.log("\n\n" + csvArray + "\n\n");
	var arrKeys = csvArray[0].split(',');

	for(var i = 1; i < csvArray.length; i++) {
		var obj = {};
		var arrCurContact = csvArray[i].split(",");
		for (var field = 0; field < arrCurContact.length; field++) {
			obj[arrKeys[field]] = arrCurContact[field]
		}

		//make sure values are complete:
		if(Object.keys(obj).length === arrKeys.length){
			arrContacts.push(obj);
		}
	}
	return arrContacts;
}
