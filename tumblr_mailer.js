/*
*
*here is the json of my blog (GET request with someone else's API key)
*https://api.tumblr.com/v2/blog/js-on-js.tumblr.com/posts/text?api_key=fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4
*MORE DOCUMENTATION HERE: https://www.tumblr.com/docs/en/api/v2
*
*/


//TODO: Call this after tumblr posts have been read
var createCustomizedEmails = function() {
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
		moreData.latestPosts = [];
		//todo: add recent blog posts

		//var customizedTemplate = ejs.render(emailTemplate, {firstName: "Jonatan", numMonthsSinceContact: "5"});
		var customizedTemplate = ejs.render(emailTemplate, moreData);
		//console.log(customizedTemplate);
	});
};




// var callToTumblr = function() {
// 	console.log("Entering CallToTumblr");
// 	var blogName = "js-on-js";
// 	var maxPostAge = 7;
// 	var callback;

// 	if(arguments.length > 0)
// 	{
// 		blogName = arguments[0].blogName || blogName;
// 		maxPostAge = arguments[0].numDays || maxPostAge;
// 		for(var i = 0; i < arguments.length; i++) {
// 			if (typeof arguments[i] === 'function') {
// 				callback = arguments[i];
// 			}
// 		}
// 	}
// //need callback here:
// 	var myArr = callback(blogName, maxPostAge);
// 	console.log("got the aRRAY: " + myArr.length);

// };


//references:
var fs = require("fs");
var ejs = require("ejs");
var tumblr = require('tumblr.js');
var secrets = require('./secrets.js');


//access secrets.js
var client = tumblr.createClient(secrets.TUMBLR_CONFIG);

//posts[]
//need to callback()
//var posts = getTumblrPosts({blogName: "js-on-js", numDays: 7});
var posts = getTumblrPosts(function() {
	//after posts is read
	console.log(posts + " is " + typeof posts);
console.log(Array.isArray(posts));

console.log("Number of new posts: " + posts.length);
posts.forEach(function(p){
	console.log(p);
	console.log(p.date + "\t" + p.title);

});
});



function getTumblrPosts() {
	var blogName = "js-on-js";
 	var maxPostAge = 7;
 	var arrNewPosts = [];
	client.posts(blogName, function(err, blog){
	  console.log("HELLO");
	  console.log("num posts: " + blog.posts.length +"\n\n");
	  for(var post in blog.posts) {
	  	//calculate post age:
	  	var today = new Date();
	  	var postDate = new Date(blog.posts[post].date);
	  	var postAge = Math.ceil((today - postDate) / (1000 * 3600 * 24));
	  	console.log("Post Age: " + today + "-" + postDate + " = " + postAge);
	  	if(Number(postAge) <= Number(maxPostAge)) {
	  		console.log("LIHLILLKJL:JL:LSLSJ");
	  		var p = {
	  			"date": blog.posts[post].date,
	  			"title" : blog.posts[post].title,
	  			"url" : blog.posts[post].post_url
	  		}
	  		arrNewPosts.push(p);
	  		console.log("return array sizeONE: " + arrNewPosts.length);
	  	}
	  }
	  console.log("return array sizeTWO: " + arrNewPosts.length);
	});
	console.log	("returning " + arrNewPosts);
	return arrNewPosts;
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



function customizeEmail(contact, emailBody) {
	var customEmail = emailBody;//set it to a different variable, since it's been referenced byval only
	console.log("\n\n\nI SHOULD NOT SEE THIS\n\n\n");
	for(var prop in contact) {
		console.log(prop + ": " + contact[prop]);
		//SNAKE_CASE it and replace it in emailbody
		var strToReplace = toSnakeCase(prop);
		customEmail = customEmail.replace(strToReplace, contact[prop]);
	}
	return customEmail;
}


//modified from here:
//http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
function toSnakeCase(str){
	var modStr =  str.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();}).toUpperCase();
	return modStr;
};



// ///OLD: loop through array of contacts to customize HTML email:
// contacts.forEach(function(c){
// 		var emailBody = fs.readFileSync("views/email_template.html");
// 		emailBody = customizeEmail(c, emailBody.toString());
// 		console.log("Email: \n" + emailBody);
// });