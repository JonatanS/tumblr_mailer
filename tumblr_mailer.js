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
var mandrill = require('mandrill-api/mandrill');

//access secrets.js
var tumblr_client = tumblr.createClient(secrets.TUMBLR_CONFIG);

var mandrill_client = new mandrill.Mandrill(secrets.MANDRILL_CONFIG.api_key);


//start the process with callbacks
getTumblrPosts(createCustomizedEmails);



function createCustomizedEmails(objPosts) {
	objPosts["newPosts"].forEach(function(p, index) {
		console.log("looking at post #" + index);
		for(var prop in p) {
			console.log(prop + ": " + p[prop]);
		}
	});

		objPosts["oldPosts"].forEach(function(p, index) {
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
		var data = {};
		data.firstName = c.firstName;
		data.numMonthsSinceContact = c.numMonthsSinceContact;

		data.latestPosts = objPosts["newPosts"];
		data.olderPosts = objPosts["oldPosts"];

		var customizedTemplate = ejs.render(emailTemplate, data);

		//function sendEmail(to_name, to_email, from_name, from_email, subject, message_html)
		sendEmail(c.firstName, c.emailAddress, "Jonatan", "jonatan@jschumacher.com", "my blog", customizedTemplate);
	});
}


function getTumblrPosts(callback) {
	var blogName = "js-on-js";
 	var maxPostAge = 7;
 	var arrNewPosts = [];
 	var arrOldPosts = [];
	tumblr_client.posts(blogName, function(err, blog){

		console.log("num posts: " + blog.posts.length);
		for(var post in blog.posts) {

	  		var p = {
	  			"date": blog.posts[post].date,
	  			"title" : (blog.posts[post].title == undefined ? "untitled" : blog.posts[post].title),
	  			"url" : blog.posts[post].post_url
	  		};
	  		console.log("TITLE: " + p["title"]);

		  	//calculate post age:
		  	var today = new Date();
		  	var postDate = new Date(blog.posts[post].date);
		  	var postAge = Math.ceil((today - postDate) / (1000 * 3600 * 24));
		  	//console.log("Post Age: " + today + "-" + postDate + " = " + postAge);

	  		
		  	if(Number(postAge) <= Number(maxPostAge)) {
	  			arrNewPosts.push(p);
	  		}
	  		else {
	  			arrOldPosts.push(p);
	  		}
		}

		AllPosts = {
			newPosts : arrNewPosts,
			oldPosts : arrOldPosts
		};
		//THIS IS THE TRICK: RETURN ARRAYS FROM HERE	  
		console.log	("\n\n\nreturning Object with " + arrNewPosts.length + "new post(s)\n\n\n");
		callback(AllPosts);
		//return arrNewPosts;
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


 function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }
