const express = require('express');
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const BASE_URL = "http://127.0.0.1:5000";

async function getAllBooksAsync() {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
}

function getBooksByISBNPromise(isbn) {
  return axios
    .get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => response.data);
}

async function getBooksByAuthor(author) {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
}


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json({ isbn, ...book });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const authorQuery = decodeURIComponent(req.params.author).toLowerCase();
  const filteredBooks = Object.entries(books)
    .filter(([, book]) => book.author.toLowerCase() === authorQuery)
    .map(([isbn, book]) => ({ isbn, ...book }));

  if (filteredBooks.length === 0) {
    return res.status(404).json({ message: "No books found for the provided author" });
  }

  return res.status(200).json(filteredBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const titleQuery = decodeURIComponent(req.params.title).toLowerCase();
  const filteredBooks = Object.entries(books)
    .filter(([, book]) => book.title.toLowerCase().includes(titleQuery))
    .map(([isbn, book]) => ({ isbn, ...book }));

  if (filteredBooks.length === 0) {
    return res.status(404).json({ message: "No books found for the provided title" });
  }

  return res.status(200).json(filteredBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json({
    isbn,
    title: book.title,
    reviews: book.reviews,
  });
});

module.exports.general = public_users;
module.exports.BASE_URL = BASE_URL;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBooksByISBNPromise = getBooksByISBNPromise;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
