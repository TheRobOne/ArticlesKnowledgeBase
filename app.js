const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//Bring in article model
let Article = require('./models/article');

const app = express();

// Bring in bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//connect do DB
const nodekb = 'mongodb://localhost/nodekb';
mongoose.connect(nodekb);
let db = mongoose.connection;

//check for errors
db.once('openUri', () => {
  console.log("Connect to mongodb");
});

db.on('error', (err) => {
  console.log(err);
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

//get method add article route
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

  article.save(function(err){
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
});

//start app
app.listen(3000, () => {
  console.log('Run app on port 3000');
});
