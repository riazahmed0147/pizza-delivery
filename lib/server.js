/*
 * Server-related tasks
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var helpers = require('./helpers');
var handlers = require('./handlers');
var path = require('path');
var util = require('util');
var debug = util.debuglog('server');

// Instantiate ther server model object
var server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res) {
	server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
	'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
	'cert' : fs.readFileSync(path.join(__dirname,'../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions,function(req, res) {
	server.unifiedServer(req, res);
});



// All the server logic for both the http and https server
server.unifiedServer = function(req, res) {

	// Get the URL and parse it
	var parsedUrl = url.parse(req.url, true);

	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// Get the query string as an object
	var queryStringObject = parsedUrl.query;

	// Get the HTTP method
	var method = req.method.toLowerCase();

	// Get the headers as an object
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data',function(data){
		buffer += decoder.write(data);
	});
	req.on('end', function(){
		buffer += decoder.end();

		// Choose the handler this request should go to. If one is not found send it to not found handler
		var chosenHanlder = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

		// If the request is within the public directory, use the public handler instead
		chosenHanlder = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHanlder;
		
		// Construct the data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : helpers.parseJsonToObject(buffer)
		};

		// Route the request the request to the handler specified in the router
		chosenHanlder(data, function(statusCode, payload, contentType) {

			// Determine the type of response (fallback to JSON)
			contentType = typeof(contentType) == 'string' ? contentType : 'json';

			debug(typeof statusCode);
			// Use the status code callback by the handler, or default to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			// Return the response parts that are content specific
			var payloadString = '';
			if(contentType == 'json') {
				res.setHeader('Content-Type', 'application/json');
				payload = typeof(payload) == 'object' ? payload : {};
				payloadString = JSON.stringify(payload);
			}

			if (contentType == 'html') {
				res.setHeader('Content-Type', 'text/html');
				payloadString = typeof(payload) == 'string' ? payload : '';
			}

			if (contentType == 'gif') {
				res.setHeader('Content-Type', 'image/x-icon');
				payloadString = typeof(payload) !== 'undefined' ? payload : '';
			}

			if (contentType == 'css') {
				res.setHeader('Content-Type', 'text/css');
				payloadString = typeof(payload) !== 'undefined' ? payload : '';
			}

			if (contentType == 'png') {
				res.setHeader('Content-Type', 'image/png');
				payloadString = typeof(payload) !== 'undefined' ? payload : '';
			}

			if (contentType == 'jpg') {
				res.setHeader('Content-Type', 'image/jpeg');
				payloadString = typeof(payload) !== 'undefined' ? payload : '';
			}

			if (contentType == 'plain') {
				res.setHeader('Content-Type', 'text/plain');
				payloadString = typeof(payload) !== 'undefined' ? payload : '';
			}

			// Returns the response-parts that are common to all content-types
			res.writeHead(statusCode);
			res.end(payloadString);

			// If the response is 200, print green otherwise print red
			if(statusCode == 200) {
				debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
			} else {				
				debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
			}
		});

	});
};

// Define a request router
server.router = {
	'' : handlers.index,
	'account/create' : handlers.accountCreate,
	'account/edit' : handlers.accountEdit,
	'account/deleted' : handlers.accountDeleted,
	'session/create' : handlers.sessionCreate,
	'session/deleted' : handlers.sessionDeleted,
	'menu/all' : handlers.menuShow,
	'cart/all' : handlers.cartShow,
	'user/checkout' : handlers.userCheckout,
	'user/success' : handlers.paymentSuccess,
	'ping' : handlers.ping,
	'api/users' : handlers.users,
	'api/tokens' : handlers.tokens,
	'api/menu' : handlers.menu,
	'api/cart' : handlers.cart,
	'api/checkout' : handlers.checkout,
	'favicon.ico' : handlers.favicon,
	'public' : handlers.public
}

// Init script
server.init = function() {
	// Start the HTTP Server
	server.httpServer.listen(config.httpPort, function() {
		console.log('\x1b[36m%s\x1b[0m', 'The server is listening on port '+config.httpPort);
	});

	// Start the HTTPS server
	server.httpsServer.listen(config.httpsPort, function() {
		console.log('\x1b[35m%s\x1b[0m', 'The server is listening on port '+config.httpsPort);

	});
}

// Export the module
module.exports = server;