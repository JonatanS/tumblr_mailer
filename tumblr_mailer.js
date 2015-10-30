var fs = require("fs");

var csvFile = fs.readFileSync("./data/friend_list.csv","utf8");
console.log(csvFile);
var contacts = csvParse(csvFile);
//console.log(contacts);
console.log("GOT THE CONTACTS!\n\n");

///loop through array of contacts:
contacts.forEach(function(c){
		var emailBody = fs.readFileSync("views/email_template.html");
		emailBody = customizeEmail(c, emailBody.toString());
		console.log("Email: \n" + emailBody);
	// });
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