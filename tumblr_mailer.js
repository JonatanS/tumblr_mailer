var fs = require("fs");
var ejs = require("ejs");

//Read CSV file with Contacts:
var csvFile = fs.readFileSync("./data/friend_list.csv","utf8");
console.log(csvFile);

//Parse Contacts in contacts[]:
var contacts = csvParse(csvFile);

// ///OLD: loop through array of contacts to customize HTML email:
// contacts.forEach(function(c){
// 		var emailBody = fs.readFileSync("views/email_template.html");
// 		emailBody = customizeEmail(c, emailBody.toString());
// 		console.log("Email: \n" + emailBody);
// });

//Loop through contacts[] to customize email ejs
var emailTemplate = fs.readFileSync("views/email_template.html").toString();
contacts.forEach(function(c){
	console.log(c.firstName + ": " + c.numMonthsSinceContact + '\n');
	
	//var customizedTemplate = ejs.render(emailTemplate, {firstName: "Jonatan", numMonthsSinceContact: "5"});
	var customizedTemplate = ejs.render(emailTemplate, c);
	console.log(customizedTemplate);
});








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