const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now
  },
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'generic'
  },
  status: {
    type: String,
    default: 'sent'
  },
  html: {
    type: String
  }
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
