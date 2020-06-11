const { urlDatabase } = require("./userDatabase");
const { users } = require("./userDatabase");
const bcrypt = require("bcrypt");

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

const findUserForLogin = (email, password, users) => {
  for (let userId in users) {
    if (users[userId].email === email && bcrypt.compareSync(password, users[userId].password)) {
      return userId;
    }
  }
  return false;
};
const findUserByEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return false;
};

const urlsForUser = (id) => {
  let obj = {};
  for (const i in urlDatabase) {
    if (id === urlDatabase[i].userId) {
      obj[i] = urlDatabase[i];
    }
  }
  return obj;
};

module.exports = {generateRandomString, findUserByEmail, findUserForLogin, urlsForUser}