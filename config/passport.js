const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const dbConfig = require('../config/database');
const bcrypt = require('bcrypt');

module.exports = (passport) => {
  //Local Strategy
  passport.use(new LocalStrategy((email, password, done) => {
      //Match email
      let query = {email: email}
      User.findOne(query, (err, user) => {
        if(err){
          console.log(err);
        }
        if(!user) {
          return done(null, false, {message: 'No user found'});
        }

        //Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if(err){
            console.log(err);
          }
          if(isMatch){
            return done(null, user);
          } else {
            return done(null, false, {message: 'Wrong password'});
          }
        });
      });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}
