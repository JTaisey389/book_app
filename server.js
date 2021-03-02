'use strict';
// ============= Packages =========
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const app = express();


//============== PORT =============
const PORT = process.env.PORT;

// ============= Variables ==============
// const bookCreate = {
//   title: 'Jasons Book',
//   author: 'Jason',
//   description: 'A thrilling novel',
// };
// const paperback = [bookCreate];


// ============= Access ==============
app.use(express.static('./public')); // server all the files in the specified folder
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// ============= Routes ==============
app.get('/hello', (res) =>{res.render('pages/index');}); // .send will update and send information now we want to .render. First one to be searches and in the parens pass a string of the filename

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs');
});

// ============= Post ==============
app.post('/searches/new', (req, res) => {
  let bookSearch = req.body.bookSearch;
  let search = req.body.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${search}:${bookSearch}`;
  superagent.get(url)
    .then(returnData => {
      const bookArr = returnData.body.items.map(bookSearch => new Books(bookSearch));
      res.render('pages/searches/show.ejs', {bookArr:bookArr});
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Sorry something whent wrong with bringing your books back, please pay the fee');
    });
});

function Books(object) {
  this.img = object.volumeInfo.imageLinks ? object.volumeInfo.imageLinks.smallThumbnail : "https://i.imgur.com/J5LVHEL.jpg";
  this.title = object.volumeInfo.title;
  this.author = object.volumeInfo.authors;
  this.description = object.volumeInfo.description;
  this.pubDate = object.volumeInfo.publishedDate;
}



// ============= Listen ==============
app.listen(PORT, () => console.log(`up on http://localhost:${PORT}/index.ejs`));
