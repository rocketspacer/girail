const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//------------------------------------------------------------------------
// Schema definition
const mappingSchema = mongoose.Schema({
  // Mailbox
  mailboxId: { type: String, trim: true, required: true },

  // Message
  messageId   : { type: String, trim: true, required: true },
  threadId    : { type: String, trim: true, required: true },
  type        : { type: String, trim: true },
  contentHash : { type: String, required: true },

  // Jira entity
  issueId   : { type: String, trim: true },
  issueKey  : { type: String, trim: true },
  commentId : { type: String, trim: true },
});

mappingSchema.index({ mailboxId: 1, threadId: 1, messageId: 1 }, { unique: true });
mappingSchema.index({ mailboxId: 1, threadId: 1, contentHash: 1 });

//------------------------------------------------------------------------
// Schema Statics


//------------------------------------------------------------------------
// Exports
module.exports = mongoose.model('Mapping', mappingSchema);
