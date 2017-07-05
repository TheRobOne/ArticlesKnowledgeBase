const express = require('express');
const path = require('path');

const app = express();

//set views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//home route
app.get('/', (req, res) => {
  let articles = [
    {
      id: 1,
      title: 'Article One',
      author: 'Maciej Rusek',
      desc: 'This is article one'
    },
    {
      id: 2,
      title: 'Article Two',
      author: 'Maciej Rusek',
      desc: 'This is article two'
    },
    {
      id: 3,
      title: 'Article Three',
      author: 'Maciej Rusek',
      desc: 'This is article three'
    }
  ];
  res.render('index', {
    title: 'Home',
    articles: articles
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
