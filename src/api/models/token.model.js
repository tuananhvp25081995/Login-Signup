var mongoose = require('mongoose')

var tokenSchema = new mongoose.Schema({
  _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
});

var Token = mongoose.model('Token', tokenSchema , 'token');

module.exports = Token;
