var md5 = require('md5');
const User = require('../models/user.model');
const UserNew = require('../models/user_new.model');
const Token = require('../models/token.model');
const crypto = require('crypto');
const nodemailer = require("nodemailer");

module.exports.setSession = (user, done) => {
  done(null, user.id);
}

module.exports.setSessions = (id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
}

module.exports.profiles = function(accessToken, refreshToken, profile, cb) {
  if (profile.id) {
    User.findOne({googleId: profile.id})
      .then((existingUser) => {
        if (existingUser) {
          User.update({_id: "5d4bde0b2bc95f5dd14c1ff9"},{
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.name.familyName + ' ' + profile.name.givenName,
            token: accessToken 
          },function (err, docs) {
            if(err){
              console.log(err);
            }
          })
        } else {
          new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.name.familyName + ' ' + profile.name.givenName,
            token: accessToken
          })
            .save()
            .then(user => done(null, user));
        }
      })
  }
}

module.exports.logIn = async (req, res) => {
  var email = req.body.email;
  var user = await UserNew.find({email: email});
  var users = user[0]
  if(users === undefined){
    throw new Error('Email does not exist') 
  }
  var userPassword = md5(req.body.password);
  if(users.password !== userPassword){
    throw new Error('Incorrect password')
  }
  console.log("Thanh cong")
  res.cookie('userId', users._id,{
      signed: true
  });
}

module.exports.signUp = async function(req, res, next) {
  const users = await User.find({});
  const emails = users[0].email;
  UserNew.findOne({ email: req.body.email }, function (err, user) {
    if (user) return res.status(400).send({ msg: 'The email address you have entered is already associated with another account.' });
    if (emails === req.body.email) return res.status(400).send({ msg: 'The email address you have entered is already associated with another account.' });
    req.body.password = md5(req.body.password);
    user = new UserNew(req.body);
    user.save(function (err) {
      if (err) { return res.status(500).send({ msg: err.message }); }

      var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

      token.save(function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }

        var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
        var mailOptions = { from: 'abcy@gmail.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
        transporter.sendMail(mailOptions, function (err) {
          if (err) { return res.status(500).send({ msg: err.message }); }
          res.status(200).send('A verification email has been sent to ' + user.email + '.');
        });
      });
    });
  });
};

module.exports.confirmationPost = function (req, res, next) {
  Token.findOne({ token: req.body.token }, function (err, token) {
    if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

    UserNew.findOne({ _id: token._userId, email: req.body.email }, function (err, user) {
      if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
      if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

      user.isVerified = true;
      user.save(function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        res.status(200).send("The account has been verified. Please log in.");
      });
    });
  });
};

module.exports.resendTokenPost = function (req, res, next) {
  UserNew.findOne({ email: req.body.email }, function (err, user) {
    if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
    if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

    var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

    token.save(function (err) {
      if (err) { return res.status(500).send({ msg: err.message }); }

      var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
      var mailOptions = { from: 'abc@codemoto.io', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
      transporter.sendMail(mailOptions, function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        res.status(200).send('A verification email has been sent to ' + user.email + '.');
      });
    });

  });
};