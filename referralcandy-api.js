const https = require('https');
const http = require('http');

const md5 = require('md5');
const request = require('request');

var accessId = "<Your API access ID>";
var secret = "<Your API secret key>";

const verify = function(responseObject){
	var theObject = {timestamp: Date.now(), accessID: accessId};
	var paramNames = Object.keys(theObject)
		.sort();

	var finalString = paramNames.reduce((paramString, currentValue) => {
		return paramString + currentValue + "=" + theObject[currentValue];
	}, "");

	theObject.signature = md5(secret + finalString);
	paramNames = Object.keys(theObject);
	var getString = paramNames.reduce((paramString, currentValue) => {
			return paramString + currentValue + "=" + theObject[currentValue] + "&";
		}, "");

	https.get("https://my.referralcandy.com/api/v1/verify.json?" + getString,
		function(response){
			response.setEncoding("utf8");
			response.on("data", function(data){
				responseObject.end(data);
			});
			response.on("error", function(){
				responseObject.end("There was an error");
			});
		});
};

const postRewards = function(responseObject, postJsonData){
	var theObject = {timestamp: Date.now(), accessID: accessId};
	// Unify provided POST data with constants
	Object.keys(postJsonData)
		.forEach(function(element){
			theObject[element] = postJsonData[element];	
		});
	var paramNames = Object.keys(theObject)
		.sort();

	var finalString = paramNames.reduce((paramString, currentValue) => {
		return paramString + currentValue + "=" + theObject[currentValue];
	}, "");

	theObject.signature = md5(secret + finalString);
	
	request.post('https://my.referralcandy.com/api/v1/rewards.json', 
		{form:theObject},
		function optionalCallback(err, httpResponse, body) {
			if (err) {
				responseObject.end('POST failed:' + err);
			}
			responseObject.end('Server responded with:' + body);
	});
};

var server = http.createServer(function(request, response) {
		if(request.url.indexOf('verify') > -1) {
			verify(response);
		}
		else if(request.url.indexOf('post-rewards') > -1) {
			postRewards(response, { id: 1, status: 'delivered'});
		}
		else {
			response.end("API test");
		}
    });
server.listen(8089);