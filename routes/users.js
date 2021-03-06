const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const router = express.Router();
const passport = require('passport');
const transporter = require('../models/nodemailer');

//Bring in user model
let User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {

  let query = {email: req.body.email}
  User.findOne(query, (err, user) => {
    if(err){
      console.log(err);
    }
    if(user){
      req.flash('danger', 'User with provided email already exists');
      res.redirect('register');
    } else {
      const name = req.body.name;
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      const password2 = req.body.password2;

      req.checkBody('name', 'Name is required').notEmpty();
      req.checkBody('username', 'Username is required').notEmpty();
      req.checkBody('email', 'Email is required').notEmpty();
      req.checkBody('password', 'Password is required').notEmpty();
      req.checkBody('email', 'Use valid email').isEmail();
      req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

      let errors = req.validationErrors();

      if(errors){
        res.render('register', {
          errors: errors
        });
      } else {
        let newUser = new User({
          name: name,
          email: email,
          username: username,
          password: password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err){
              console.log(err);
            } else{
              newUser.password = hash;
              newUser.save((err) => {
                if(err){
                  console.log(err);
                } else {
                  let activationLink = 'localhost:3000/users/activate/' + newUser._id;
                  sendActivationEmail(newUser.email, activationLink);
                  req.flash('success', 'You are now registered, check email to activate acount');
                  res.redirect('login');
                }
              });
            }
          });
        });
      }
    }
  });
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

router.get('/activate/:id', (req, res) => {
  let user = {};
  user.activated = true;

  let query = {_id:req.params.id}

  User.update(query, user, (err) => {
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'Actiavtion completed, now you can log in.');
      res.redirect('/');
    }
  });
});

//get user by id
router.get('/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if(err){
      console.log(err);
    } else {
      User.find({}, (err, users) => {
        if (err){
          console.log(err);
        } else{
          res.render('user', {
            user: user,
            users: users
          });
        }
      });
    }
  });
});

//edit user by id
router.get('/edit/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if(err){
      console.log(err);
    } else {
      res.render('edit_user', {
        user: user
      });
    }
  });
});

router.post('/edit/:id', (req, res) => {
  let user = {};
  user.username = req.body.username;
  user.name = req.body.name;
  user.email = req.body.email;

  let query = {_id: req.params.id}

  User.update(query, user, (err) => {
    if (err){
      console.log(err);
    }
    console.log("elo");
    if(User.email !== user.email){
      console.log("elo3");
      User.update(query, {activated: false}, (err) => {
        if(err){
          console.log(err);
        }
        else{
          req.flash('success', 'You have to activate new email')
        }
      });
    }
  });
});

router.post('/edit/:id', (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  User.update(query, a, (err) => {
    if(err){
      console.log(err);
      return;
    }
    req.flash('success', 'Article edited');
    res.redirect('/');
  });
});

router.delete('/:id', (req, res) => {
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, (err, article) => {
    if(article.author != req.user._id){
      res.status(500).send();
    } else {

      Article.remove(query, (err) => {
        if(err){
          console.log(err);
        } else {
          req.flash('danger', 'Article deleted');
          res.send('Success');
        }
      });
    }
  });
});

function sendActivationEmail(receiver, activationLink){

  let mailOptions = {
    from: 'node.kb@interia.pl',
    to: receiver,
    subject: 'This is your activation link.',
    text: 'activationLink',
    html: '<p> <a href="' + activationLink + '">Activate account! </a> </p>'
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if(err){
      console.log(err);
    } else {
      console.log('Message %s sent: %s', info.messageId, info.response);
    }
  });

}

module.exports = router
