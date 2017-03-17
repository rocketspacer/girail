//========================================================================================================
// Dependencies
var google = require('googleapis');
var database = require('./database');
var helpers = require('./helpers');
var EventProcessor = require('./processors/EventProcessor');
var GMailProcessor = require('./processors/GMailProcessor');
var JiraProcessor = require('./processors/JiraProcessor');
var CompositeProcessor = require('./processors/CompositeProcessor');

//========================================================================================================
// Credentials
var oauth2Credentials = require('./credentials/oauth-secret.json').installed;
var oauth2Tokens = require('./credentials/access-token.json');

//========================================================================================================
// OAuth2 Client
var oauth2Client = new google.auth.OAuth2(
    oauth2Credentials.client_id,
    oauth2Credentials.client_secret,
    oauth2Credentials.redirect_uris[0]
);
oauth2Client.setCredentials(oauth2Tokens);

//========================================================================================================
// Pipeline Processors
var gmailProcessor = new GMailProcessor(oauth2Client);
var jiraProcessor = new JiraProcessor();
var compositeProcessor = new CompositeProcessor(gmailProcessor, jiraProcessor);
var eventProcessor = new EventProcessor();

//========================================================================================================
// Google Function Handler (Same as AWS Lambda Function)
exports.syncMail = function (event, callback) {            

    // [Event Carry Object].[PubSub eventMessage].[GMail eventMessage]
    var eventMessage = event.data.data;

    // No GMail eventMessage: return Error
    if (!eventMessage) return callback(new Error("Empty GMail message"));

    // Decode eventMessage (base64)
    // eventMessage = JSON.parse(Buffer.from(eventMessage, 'base64').toString());
    eventMessage = {historyId: 12000};

    //---------------------------------------------------------------------------
    // Processing Pipeline: Each component take preceding result as parameter
    //---------------------------------------------------------------------------
    console.log("Ready to process received message:", eventMessage);
    // S1: Connect to database, database type should be replaceable
    database.connect()
        // S2: Inject eventMessage to pipeline
        .then(() => Promise.resolve(eventMessage)) 
        // S3: Get all messages with label unprocessed
        .then(/* TO DO */)
        .then(helpers.log('Unprocessed messages'))
        // S4: Re-label unprocessed messages to processing
        .then(/* TO DO */)
        .then(helpers.log('Processing Messages'))
        // S6: Get details of those messages
        .then((processingMessages) => gmailProcessor.getDetailedMessages(processingMessages))
        .then(helpers.log('Detailed Messages'))
        // S7: Format messages to cleaner format, ready for Jira
        .then((detailedMessages) => gmailProcessor.formatMessages(detailedMessages))
        .then(helpers.log('Formatted Messages'))
        // S8: Create Jira Issue/Comments based on messages
        .then((formattedMessages) => jiraProcessor.createEntities(formattedMessages))
        .then(helpers.log('Mapped Messages'))
        // S9: Download and Upload Attachments
        .then((mappedMessages) => compositeProcessor.forwardAttachments(mappedMessages))
        // S10: Close database connection
        .then(database.disconnect)
        // S11: Response to issuer
        .then(() => {
            console.log('Everything OK');
            callback(null, 'OK');
        })
        // S*: Handle Errors
        .catch((err) => {
            console.log(err);
            database.disconnect();
            callback(err);
        });
};