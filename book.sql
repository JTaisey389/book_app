DROP TABLE book_table;
CREATE TABLE book_table (
  id SERIAL PRIMARY KEY, 
  title VARCHAR(255),
  author VARCHAR(255),
  description VARCHAR(255),
  image VARCHAR(255)
)