'use strict'
// ============= Packages =========
const express = require('express');
require('dotenv').config();

const app = express();//express() returns a fully ready to run server object

//============== PORT =============
const PORT = process.env.PORT;

// ============= Variables ==============
const paperback = ['books'];
app.set('view engine', 'ejs');

// ============= Access ==============
app.use(express.static('./public')); // server all the files in the specified folder
app.use(express.urlencoded({extended: true}));

// ============= Routes ==============
app.get('/searches/new', (req, res) => {
  res.render(paperback); // .send will update and send information now we want to .render. First one to be searches and in the parens pass a string of the filename 
});

app.get('/hello', (req, res) =>
{res.render('pages/index'); // .send will update and send information now we want to .render. First one to be searches and in the parens pass a string of the filename 
});

// ============= Post ==============
app.post('/create-books', (req, res) => { //create-books will target the HTML file
  console.log(req.body);
  res.render(paperback);
});

// ============= Listen ==============
app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));
