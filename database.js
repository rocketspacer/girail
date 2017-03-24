//------------------------------------------------------------------------
// Dependencies
var helpers = require('./helpers');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise; //Use native ES6 Promise instead of Mongoose's default

//------------------------------------------------------------------------
// Configurations
var dbConfigs = require('./configs/database-conf.json');

//------------------------------------------------------------------------
// Models
var Mapping = require('./models/Mapping');

//------------------------------------------------------------------------
var connectPromise = new Promise((fulfill, reject) => {
    mongoose.connect(dbConfigs.database_url, (err) => {
        if (err) reject(err);
        else fulfill();
    });
});

//------------------------------------------------------------------------
exports.connect = function (callback) {

    //-------------------------    
    return helpers.wrapAPI(connectPromise, callback);
};

//------------------------------------------------------------------------
exports.findReplySourceMapping = function (replyMessage, callback) {

    var promise = new Promise((fulfill, reject) => {
        Mapping
            .findOne({ threadId: replyMessage.threadId, issueId: { $exists: true, $ne: null } })
            .exec((err, mapping) => {
                if (err) return reject(err);
                
                fulfill(mapping);
            });
    });

    //-------------------------
    return helpers.wrapAPI(promise, callback);
};

//------------------------------------------------------------------------
exports.createMapping = function (message, callback) {

    var promise = new Promise((fulfill, reject) => {
        var mapping = new Mapping({
            messageId: message.id,
            threadId: message.threadId
        });

        mapping.save((err) => {
            if (err) return reject(err);
            fulfill(mapping);
        });
    });

    //-------------------------
    return helpers.wrapAPI(promise, callback);
};

//------------------------------------------------------------------------
exports.updateMapping = function (message, callback) {

    var promise = new Promise((fulfill, reject) => {
        Mapping
            .findOne({ messageId: message.id, threadId: message.threadId })
            .exec((err, mapping) => {
                if (err) return reject(err);

                // if (!mapping) // TO_DO


                mapping.issueId = message.issueId;
                mapping.issueKey = message.issueKey;
                mapping.commentId = message.commentId;
                mapping.save((err) => {
                    if (err) return reject(err);
                    fulfill(mapping);
                });
            });
    });

    //-------------------------
    return helpers.wrapAPI(promise, callback);
};

//------------------------------------------------------------------------
exports.getMapping = function (message, callback) {

    var promise = new Promise((fulfill, reject) => {
        Mapping
            .findOne({ messageId: message.id, threadId: message.threadId })
            .exec((err, mapping) => {
                if (err) return reject(err);
                fulfill(mapping);
            });
    });

    //-------------------------
    return helpers.wrapAPI(promise, callback);
};