require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const passports = require('./controllers/user.controller')
const cookieSession = require('cookie-session');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require('mongoose');
const userRouter = require('./routers/user.router');

mongoose.connect('mongodb://127.0.0.1:27017/task-manager', {useNewUrlParser: true});

app.use(cookieParser("123i1023"));

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./key');
const PORT = process.env.PORT || 3000;
app.listen(PORT,function(){
  console.log('Server listening on port' + PORT);
})



app.get(
  '/api/user/login',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
  );
  
app.use('/user',userRouter);
  
passport.serializeUser(passports.setSession);

passport.deserializeUser(passports.setSessions);

passport.use(
  new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    scope: 'profile',
    callbackURL: '/api/user/login'
  }, passports.profiles)
);


app.use(
  cookieSession({
    maxAge: 7 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);
app.use(passport.initialize());
app.use(passport.session());
