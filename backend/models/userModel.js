// models/userModel.js
const db = require('../db');

const createUser = (user, callback) => {
  const { email, username, phone, password } = user;
  const sql = 'INSERT INTO users (email, username, phone, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [email, username, phone, password], callback);
};

const findUserByEmailAndPassword = (email, password, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], callback);
};

exports.findUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

module.exports = {
  createUser,
  findUserByEmailAndPassword,
};
