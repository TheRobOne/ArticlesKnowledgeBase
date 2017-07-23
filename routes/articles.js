const express = require('express');
const router = express.Router();

//Bring in article and user model
let Article = require('../models/article');
let User = require('../models/user');

//get method for add article route
router.get('/add', ensureAuthenticated, (req,res) =>{
  res.render('add_article', {
    title: 'add article'
  });
});

//post method for add article route
router.post('/add', function(req, res){
  req.checkBody('title', 'Titile is required.').notEmpty();
  req.checkBody('body', 'Body is required.').notEmpty();

  //get errors
  let errors = req.validationErrors();

  if(errors){
    req.flash('danger', 'Fill all fields');
    res.render('add_article', {
      title: 'Add article',
      errors: errors
    });
  } else{
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save((err) => {
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article added');
        res.redirect('/');
      }
    });
  }
});

//get article by id for edit
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err){
      console.log(err);
    } else {
      if(article.author != req.user._id){
        req.flash('danger', 'Not authorized')
      } else {
        res.render('edit_article', {
          title: 'Edit Article',
          article: article
        });
      }
    }
  });
});

router.post('/edit/:id', (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, (err) => {
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article edited');
      res.redirect('/');
    }
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

//get article by id
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err){
      console.log(err);
    } else {
      User.findById(article.author, (err, user) => {
        if (err){
          console.log(err);
        } else {
        res.render('article', {
          article: article,
          author: user.name
        });
        }
      });
    }
  });
});

//Access controller
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
