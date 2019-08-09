var mongoose = require('mongoose')

var userNewSchema = new mongoose.Schema({
  email: String,
  password: String,
  isVerified: { type: Boolean, default: false }
});

var UserNew = mongoose.model('UserNew', userNewSchema , 'usernew');

module.exports = UserNew;
