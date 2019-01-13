/*
 * Create and export configuration variables
 *
 */

// Container for all environments
var environments = {};

// Staging (default) environment

environments.staging = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'staging',
	'hashingSecret' : 'thisIsASecret',
	'stripe' : {
		'secretkey' : 'sk_test_y374KGWtOmYAg2dwOw3NFJua'
	},
	'mailgun' : {
		'secretkey' : '8a071649e07ddfe7fa2de6733a60bd56-49a2671e-9dbe9bf1'
	},
	'templateGlobals' : {
		'appName' : 'pizzaDelivery',
		'companyName' : 'NotARealCompany, Inc',
		'yearCreated' : '2018',
		'baseUrl' : 'http://localhost:3000'
	}
};


// Production environment
environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production',
	'hashingSecret' : 'thisIsAlsoASecret',
	'stripe' : {
		'secretkey' : 'sk_test_y374KGWtOmYAg2dwOw3NFJua'
	},
	'mailgun' : {
		'secretkey' : '8a071649e07ddfe7fa2de6733a60bd56-49a2671e-9dbe9bf1'
	},
	'templateGlobals' : {
		'appName' : 'pizzaDelivery',
		'companyName' : 'NotARealCompany, Inc',
		'yearCreated' : '2018',
		'baseUrl' : 'http://localhost:5000'
	}
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current enviornment is one of the environments above, if not, default to staging
var enviornmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = enviornmentToExport;