var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  email: String,
  googleId:String,
  name: String,
  token: String
});

var User = mongoose.model('User', userSchema , 'users');

module.exports = User;
