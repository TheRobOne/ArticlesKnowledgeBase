const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

//Bring in article model
let Article = require('./models/article');

const app = express();

//connect do DB
const nodekb = 'mongodb://localhost/nodekb';
mongoose.connect(nodekb);
let db = mongoose.connection;

//check for errors
db.once('open', () => {
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
    } else {
      res.render('index', {
        title: 'Home',
        articles: articles
      });
    }
  });
});

//add article route
app.get('/articles/add', (req,res) =>{
  res.render('add_article', {
    title: 'add article'
  });
});

//start app
app.listen(3000, () => {
  console.log('Run app on port 3000');
});
