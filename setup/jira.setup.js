//========================================================================================================
// Node Dependencies
var nativeUtil = require('util');

//========================================================================================================
// External Dependencies
var async = require('async')
var lodash = require('lodash');
var JiraApi = require('jira-client');
var readlineSync = require('readline-sync');

//========================================================================================================
// Lib Dependencies
var configsAdapter = require('../lib/configs-adapter');
var utils = require('../lib/utilities');

//========================================================================================================
var newJiraSettings = {
    host: '',
    api_version: '2',
    default_issue_type: { name: 'Bug' },
    default_reporter: { name: 'admin' },
    metadata_mapping: [
        { metaName: 'Brand', fieldName: 'Brand' },
        { metaName: 'App version', fieldName: 'Affects Version/s' },
        { metaName: 'Tags', fieldName: 'Labels' }
    ],
    brand_options: ['White Label', 'Kate Spade', 'Michael Kors', 'Skagen', 'Chaps', 'Diesel', 'Emporio Armani', 'Armani Exchange', 'Tony Burch', 'DKNY', 'Marc Jacobs', 'Relic', 'Michele'],
    required_fields: ['Brand', 'Affects Version/s', 'Labels'],
    fields: {}
};

var newJiraCredentials = {
    username: '',
    password: ''
};

console.log('\n\nInitializing Jira setup...');
console.log('======================================================');
newJiraSettings.host = readlineSync.question('Enter your jira hostname (required): ');
newJiraCredentials.username = readlineSync.question('Enter your jira username (required): ');
newJiraCredentials.password = readlineSync.question('Enter your jira password (required): ');
newJiraSettings.default_issue_type.name = readlineSync.question('Enter your jira default issue type (default Bug): ');
newJiraSettings.default_reporter.name = readlineSync.question('Enter your jira default reporter (default admin): ');

if (!newJiraSettings.default_issue_type.name || newJiraSettings.default_issue_type.name.length === 0)
    newJiraSettings.default_issue_type.name = 'Bug';

if (!newJiraSettings.default_reporter.name || newJiraSettings.default_reporter.name.length === 0)
    newJiraSettings.default_reporter.name = 'admin';


var jira = new JiraApi({
    strictSSL: true,
    protocol: 'https',
    host: newJiraSettings.host,
    apiVersion: newJiraSettings.api_version,
    username: newJiraCredentials.username,
    password: newJiraCredentials.password
});

console.log('Getting Jira required fields');
jira.listFields()
    .then((fields) => {

        fields = fields.filter(f => newJiraSettings.required_fields.includes(f.name));
        if (fields.length !== newJiraSettings.required_fields.length) {
            console.log('Not enough Jira required fields, please alert an administrator to create them');
            return;
        }

        newJiraSettings.fields = lodash.chain(fields)
            .sortBy('name')
            .keyBy('name')
            .mapValues(v => { return { id: v.id, key: v.key, type: v.schema.type }; })
            .value();

        console.log('======================================================');
        console.log('Review your Jira settings:');
        console.log(nativeUtil.inspect(newJiraSettings));
        console.log('\nReview your Jira credentials:');
        console.log(nativeUtil.inspect(newJiraCredentials));
        if (readlineSync.keyInYN('\nIs this okay?')) {
            configsAdapter.updateJiraSettings(newJiraSettings);
            console.log('Jira Settings Updated');
            configsAdapter.updateJiraCredentials(newJiraCredentials);
            console.log('Jira Credentials Updated');
        }
    })
    .catch((err) => console.log(err));