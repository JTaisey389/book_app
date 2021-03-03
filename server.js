'use strict';
// ============= Packages =========
const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;
// console.log(DATABASE_URL);
const client = new pg.Client(DATABASE_URL);


client.on ('error', error => console.log(error));
//============== PORT =============
const PORT = process.env.PORT || 3238;

// ============= Variables ==============
// const bookCreate = {
//   title: 'Jasons Book',
//   author: 'Jason',
//   description: 'A thrilling novel',
// };
// const paperback = [bookCreate];


// ============= Access ==============
app.use(express.static(__dirname + '/public')); // server all the files in the specified folder
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');

// ============= .GET ==============
app.get('/hello', (res) =>{res.render('pages/index');}); // .send will update and send information now we want to .render. First one to be searches and in the parens pass a string of the filename

app.get('/searches/new', (req,res) => {
  res.render('pages/searches/new.ejs');
});

// ============= ROUTES ===============
app.get('/', showCollection); // Get all books
app.get('/books/:id', singleBook); // Get single book
app.post('/searches/new', addBook); //adding a single book to the database
app.put('/searches/new/1', updateSingleBook); // updates one book on the page
app.delete('/searches/new/1', deleteBook); // Remove a book from the list

// ============ Functions =========
function showCollection(req, res) { // SAVE BOOKS
  const sqlString = 'SELECT * FROM book_table;'; // Not sure on this route
  client.query(sqlString)
    .then(result => {
      const ejsObject = { allBooks: result.rows };
      res.render('pages/index.ejs', ejsObject); // GTG
    })
    .catch(error => {
      console.log(error);
    });
}

function singleBook(req, res) {
  const bookID = req.params.id;
  const sqlString = 'SELECT * FROM book_table WHERE id=$1';// I think this is selecting from a book at the first position. SQl starts at 1 unlike arrays
  const sqlArray = [bookID]; // passing in bookID as an array to ittertate through
  client.query(sqlString, sqlArray)
    .then(result => {
      const newBook = result.rows[0];
      const ejsObject = { newBook };
      res.render('pages/books/details.ejs', ejsObject); // CHECK WITH TA's on the file path
    })
    .catch(error => {
      console.log(error);
    });
}

function addBook(req, res) {
  const sqlString = 'INSERT INTO book (title, author) VALUES ($1, $2) RETURNING id;';
  // what does this do??
  const sqlArray = [req.body.title, req.body.author];
  client.query(sqlString, sqlArray)
    .then(result => { // .then is a method of a promise
      const newBookAdd = result.rows[0].id; // I think this adds the new book at row position 0 because SQl starts at 1
      res.redirect(`/pages/${newBookAdd}`);
    })
    .catch(error => {
      console.log(error);
    });
}

function updateSingleBook(req, res) {
  res.send(updateSingleBook);
}

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
client.connect().then(() => {
  app.listen(PORT, () => {console.log(`up on http://localhost:${PORT}/index.ejs`);});
});


/* NOTES */
