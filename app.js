const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('expess-session');
const flash = require('connect-flash');

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
  saveUninitialized: true,
  cookie: { secure: true }
}));

//connect flash middleware
app.configure(function() {
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(flash());
});

//flash messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

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
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save((err) => {
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
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
      res.send('Success');
    }
  });
});

//start app
app.listen(3000, () => {
  console.log('Run app on port 3000');
});
