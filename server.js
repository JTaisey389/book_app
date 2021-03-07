'use strict';
// ============= Packages =========
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

//============== APP =============
const app = express();
const PORT = process.env.PORT || 3238;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on ('error', error => console.log(error));

app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public')); // server all the files in the specified folder
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

app.get('/hello', (res) =>{res.render('pages/index');});
// ============= ROUTES ===============

//////////////// FUNCTIONS ////////////////
app.get('/', showCollection);
function showCollection(req, res) { // SAVE BOOKS
  const sqlString = 'SELECT * FROM books_api_search;'; // Not sure on this route
  const sqlArray = [];
  client.query(sqlString, sqlArray)
    .then(result => {
      const ejsObject = { allBooks: result.rows, count:result.rows.length};
      res.render('pages/index.ejs', ejsObject);
    })
    .catch(error => {
      console.log(error);
    });
}

app.get('/books/:id/edit', checkoutBook);// this is the trello requirement
function checkoutBook(req, res) {
  const bookID = req.params.id;
  const sqlString = 'SELECT * FROM books_api_search WHERE id=$1';
  const sqlArray = [bookID]; // passing in bookID as an array to ittertate through
  client.query(sqlString, sqlArray)
    .then(result => {
      const newBook = result.rows[0];
      const ejsObject = { newBook };
      res.render('./pages/books/edit.ejs', ejsObject);
      // res.render('pages/books/edit.ejs', ejsObject);
    })
    .catch(error => {
      console.log(error);
    });
}

app.post('/books', addBook);
function addBook(req, res) {
  const {author, title, isbn, image, description} = req.body;
  const sqlString = 'INSERT INTO books_api_search (author, title, isbn, image, description) VALUES($1, $2, $3, $4, $5)';
  const sqlArray = [author, title, isbn, image, description];
  client.query(sqlString, sqlArray)
    .then(() => {
      const ejsObject = { singleBook: req.body};
      res.render('pages/books/details.ejs', ejsObject);
    })
    .catch(error => {
      console.log(error);
    });
}

/////////////////// EDITING ////////////////////////////////////////
app.get('/books/:id/edit', editBook);
function editBook(req, response) {
  const bookID = req.params.id;
  const sqlString = 'SELECT * FROM books_api_search WHERE id=$1';
  const sqlArray = [bookID];
  client.query(sqlString, sqlArray)
    .then(result => {
      const singleBook = result.rows[0];
      const ejsObject = { singleBook };
      response.render('pages/books/edit.ejs', ejsObject);
    })
    .catch(error => {
      console.log(error);
    });
}

app.put('/books/:id', updateBook);
function updateBook (req, res) {
  const {author, title, isbn, image, description} = req.body;
  const sqlString = 'UPDATE books_api_search SET author=$2, title=$3, isbn=$4, image=$5, description=$6 WHERE id=$1';
  const sqlArray = [author, title, isbn, image, description]
  client.query(sqlString, sqlArray)
    .then (() => {
      res.redirect(`/books/${req.params.id}`);
    })
    .catch(error => {
      console.log(error);
    });
}

app.delete('/books/:id', deleteBook);
function deleteBook (req, res) {
  const sqlString = `DELETE FROM books_api_search WHERE id=$1;`;
  const sqlArray = [req.params.id];
  client.query(sqlString, sqlArray)
    .then(res.redirect('/'))
    .catch(error => {
      console.log(error);
    });
}
// ============= SEARCHES ==============
app.get('/searches/new', (req,res) => {
  res.render('pages/searches/new.ejs');
});
app.post('/searches', (req, res) => {
  let bookSearch = req.body.bookSearch;
  let search = req.body.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${search}:${bookSearch}`;
  superagent.get(url)
    .then(returnData => {
      const bookArr = returnData.body.items.map(bookSearch => new Books(bookSearch));
      console.log(bookArr);
      res.render('pages/searches/show.ejs', {bookArr: bookArr});
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Sorry something whent wrong with bringing your books back, please pay the fee');
    });
});

//////////OBJECTS//////////////////////
function Books(object) {
  this.author = object.volumeInfo.authors;
  this.title = object.volumeInfo.title;
  this.isbn = object.volumeInfo.industryIdentifiers[1] ? object.volumeInfo.industryIdentifiers[1].type + object.volumeInfo.industryIdentifiers[1].identifier : 'no ISBN number';
  this.image = object.volumeInfo.imageLinks ? object.volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://') : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = object.volumeInfo.description;
}

// ============= Listen ==============
client.connect().then(() => {
  app.listen(PORT, () => {console.log(`up on http://localhost:${PORT}/index.ejs`);});
});

