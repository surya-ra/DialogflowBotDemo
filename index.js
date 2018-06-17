										/*Smart Asset Bot*/
										/**7th June 2018**/
										/****Suryadeep****/
										/*****API.AI******/
										
var builder = require('botbuilder'); 
var apiairecognizer = require('api-ai-recognizer');
var sql = require('mssql');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var restify = require('restify');
var jsonFile = require('jsonfile');

var server = restify.createServer();
var BaseQueryContent = jsonFile.readFileSync('BaseQueries.json');

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
	appId: process.env.MicrosoftAppId,
	appPassword: process.env.MicrosoftAppPassword,
  	openIdMetadata: process.env.BotOpenIdMetadata
});

//Configure and create 
var config = {
  userName: 'xxxxxx',
  password: 'xxxxxxxxx',
  server: 'x.x.x.x',
  options: {
    database: '*******',
    encrypt: true
  }
}

//Configure Connection
var connection = new Connection(config);

//set up the database connection
connection.on('connect', function (err) {
  if (err) {
    console.log(err)
  }
  else {
    console.log('Connected to database!')
  }
});

//var connector = new builder.ConsoleConnector().listen(); 
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector); 
var recognizer = new apiairecognizer("4f6c13c716fa41289371ede34c1f43ef"); 
var intents = new builder.IntentDialog({ recognizers: [recognizer] }); 
bot.dialog('/',intents);

function dbCalls(session,args){

	var RequestTrial = new Request(
		args,
		function(err,rowCount,rows){
			if(err){
				console.log('error while fetching value from database');
			}
			else{
				console.log('value fetched from database')
			}
		}
	);

	connection.execSql(RequestTrial);

	RequestTrial.on('row',function(columns){
		columns.forEach(function(column){
			session.send('%s',column.value);
		});
	});
}
function fetchQueries(session,args){
	console.log('Entity name received: '+args);
	var QueryHit;
	for (var i = 0; i<BaseQueryContent.length; i++) {
		if (BaseQueryContent[i].intent == args) {
			QueryHit = BaseQueryContent[i].query;
			dbCalls(session,QueryHit);	
		}	
	}
}

intents.matches('Asset', function(session,args){
	var AssetEntity = builder.EntityRecognizer.findEntity(args.entities,'AssetEntity');
	console.log(AssetEntity)
	fetchQueries(session,AssetEntity.entity);
});
intents.matches('Supplier', function(session,args){
	var SupplierEntity = builder.EntityRecognizer.findEntity(args.entities,'SupplierEntity');
	fetchQueries(session,SupplierEntity.entity);
});
intents.matches('Inventory', function(session,args){
	var InventoryEntity = builder.EntityRecognizer.findEntity(args.entities,'InventoryEntity');
	fetchQueries(session,InventoryEntity.entity);
});
intents.matches('Service Request', function(session,args){
	var ServicerequestEntity = builder.EntityRecognizer.findEntity(args.entities,'ServicerequestEntity');
	fetchQueries(session,ServicerequestEntity.entity);
});
intents.matches('Workforce', function(session,args){
	var WorkforceEntity = builder.EntityRecognizer.findEntity(args.entities,'WorkforceEntity');
	fetchQueries(session,WorkforceEntity.entity);
});
intents.matches('Workorder', function(session,args){
	var WorkorderEntity = builder.EntityRecognizer.findEntity(args.entities,'WorkorderEntity');
	fetchQueries(session,WorkorderEntity.entity);
});

intents.onDefault(function(session){ 
	session.send("Sorry...can you please rephrase?"); 
});
