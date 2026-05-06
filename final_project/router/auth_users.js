const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  const existingUser = users.find((user) => user.username === username);
  return !existingUser;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const matchedUser = users.find((user) => user.username === username && user.password === password);
  return Boolean(matchedUser);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login details" });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = {
    accessToken,
  };

  return res.status(200).json({ message: "User successfully logged in", accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.user.username;
  const selectedBook = books[isbn];

  if (!selectedBook) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  selectedBook.reviews[username] = review;

  return res.status(200).json({
    message: "Review added or updated successfully",
    book: {
      isbn,
      ...selectedBook,
    },
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username;
  const selectedBook = books[isbn];

  if (!selectedBook) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!selectedBook.reviews[username]) {
    return res.status(404).json({ message: "Review by this user was not found" });
  }

  delete selectedBook.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    book: {
      isbn,
      ...selectedBook,
    },
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
