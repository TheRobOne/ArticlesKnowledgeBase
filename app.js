const express = require('express');
const path = require('path');

const app = express();

//set views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//home route
app.get('/', (req, res) => {
  res.render('index');
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
