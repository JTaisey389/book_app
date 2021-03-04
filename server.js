'use strict';
// ============= Packages =========
const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

client.on ('error', error => console.log(error));
//============== PORT =============
const PORT = process.env.PORT || 3238;

// ============= Access ==============
app.use(express.static(__dirname + '/public')); // server all the files in the specified folder
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');

// ============= .GET ==============
app.get('/hello', (res) =>{res.render('pages/index');}); // .send will update and send information now we want to .render. First one to be searches and in the parens pass a string of the filename

// ============= ROUTES ===============
app.get('/searches/new', (req,res) => {
  res.render('pages/searches/new.ejs');
});

// ============ Functions =========


app.post('/books/added', addBook);
function addBook(req, res) {
  const {title, author, description, pubdate, img} = req.body;
  const sqlString = 'INSERT INTO book_table (title, author, description, pubdate, image) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
  const sqlArray = [title, author, description, pubdate, img];
  client.query(sqlString, sqlArray)
    .then(result => { // .then is a method of a promise
      const newBookAdd = result.rows[0].id; // I think this adds the new book at row position 0 because SQl starts at 1
      res.redirect(`/books/${newBookAdd}`);
    })
    .catch(error => {
      console.log(error);
    });
}

app.get('/', showCollection); // This is a trello requirment 
function showCollection(req, res) { // SAVE BOOKS
  const sqlString = 'SELECT * FROM book_table;'; // Not sure on this route
  client.query(sqlString)
    .then(result => {
      const ejsObject = { allBooks: result.rows, count:result.rows.length};
      res.render('pages/index.ejs', ejsObject);
      console.log(ejsObject);// GTG
    })
    .catch(error => {
      console.log(error);
    });
}

app.get('/books/:id', singleBook);// this is the trello requirement
function singleBook(req, res) {
  const bookID = req.params.id;
  const sqlString = 'SELECT * FROM book_table WHERE id=$1';// I think this is selecting from a book at the first position. SQl starts at 1 unlike arrays
  const sqlArray = [bookID]; // passing in bookID as an array to ittertate through
  client.query(sqlString, sqlArray)
    .then(result => {
      const newBook = result.rows[0];
      const ejsObject = { newBook };
      res.render('./pages/books/detail.ejs', ejsObject);
    })
    .catch(error => {
      console.log(error);
    });
}

app.put('/searches/new/1', updateSingleBook); // updates one book on the page
function updateSingleBook(req, res) {
  res.send(updateSingleBook);
}

app.delete('/searches/new/1', deleteBook); // Remove a book from the list
function deleteBook (req, res) {
  res.send(deleteBook);
}

// ============= Post ==============

app.post('/searches/new', (req, res) => {
  let bookSearch = req.body.bookSearch;
  let search = req.body.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${search}:${bookSearch}`;
  superagent.get(url)
    .then(returnData => {
      const bookArr = returnData.body.items.map(bookSearch => new Books(bookSearch));
      console.log(bookArr);
      res.render('pages/searches/show.ejs', {bookArr:bookArr});
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Sorry something whent wrong with bringing your books back, please pay the fee');
    });
});

function Books(object) {
  this.author = object.volumeInfo.authors;
  this.title = object.volumeInfo.title;
  this.ISBN = object.volumeInfo.industryIdentifiers[1] ? object.volumeInfo.industryIdentifiers[1].type + object.volumeInfo.industryIdentifiers[1].identifier : 'no ISBN number';
  this.image = object.volumeInfo.imageLinks ? object.volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://') : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = object.volumeInfo.description;
}
app.post('/searches/new', (req, res) => {
  res.redirect(`/books/${newBookAdd}`);
};
// ============= Listen ==============
client.connect().then(() => {
  app.listen(PORT, () => {console.log(`up on http://localhost:${PORT}/index.ejs`);});
});

/* NOTES */
