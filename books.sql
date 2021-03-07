DROP TABLE book_api_search;
CREATE TABLE book_api_search (
  id SERIAL PRIMARY KEY, 
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image VARCHAR(255),
  description VARCHAR
)