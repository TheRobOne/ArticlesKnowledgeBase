const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const expressValidator = require('express-validator');

//Bring in article model
let Article = require('./models/article');

const app = express();

// Bring in bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//set up public folder
app.use(express.static(path.join(__dirname, 'public')));

//connect do DB
const nodekb = 'mongodb://localhost/nodekb';
mongoose.connect(nodekb);
let db = mongoose.connection;

//check for errors
db.once('openUr', () => {
  console.log("Connect to mongodb");
});

db.on('error', (err) => {
  console.log(err);
});

//session middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//flash messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//set views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//home route
app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if(err){
      console.log(err);
      return;
    } else {
      res.render('index', {
        title: 'Home',
        articles: articles
      });
    }
  });
});

//get article by id
app.get('/article/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err){
      console.log(err);
    } else {
      res.render('article', {
        article: article
      });
    }
  });
});

//get method for add article route
app.get('/articles/add', (req,res) =>{
  res.render('add_article', {
    title: 'add article'
  });
});

//post method for add article route
app.post('/articles/add', function(req, res){
  req.checkBody('title', 'Titile is required.').notEmpty();
  req.checkBody('author', 'Author is required.').notEmpty();
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
    article.author = req.body.author;
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
app.get('/article/edit/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err){
      console.log(err);
    } else {
      res.render('edit_article', {
        title: 'Edit Article',
        article: article
      });
    }
  });
});

app.post('/article/edit/:id', (req, res) => {
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

app.delete('/article/:id', (req, res) => {
  let query = {_id:req.params.id}

  Article.remove(query, (err) => {
    if(err){
      console.log(err);
    } else{
      req.flash('danger', 'Article deleted');
      res.send('Success');
    }
  });
});

//start app
app.listen(3000, () => {
  console.log('Run app on port 3000');
});
