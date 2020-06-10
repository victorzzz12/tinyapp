const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');


function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//looping through the keys
const findUserByEmail = email => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
}

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: req.cookies["user"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies["user"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL: longURL, user: req.cookies["user"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.send("404 Page Not Found");
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.cookies["user"] }
  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => { //goes into the short url from the edit button
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/login", (req, res) => { //logins with given user
  res.cookie("user", req.body.user);
  res.redirect("/urls");
  let templateVars = { user: req.cookies["user"] }
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => { //logs out current user
  (res.clearCookie('user', req.body.user));
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check if user is not already in the database
  const user = findUserByEmail(email);

  if (!user) {

    const userId = generateRandomString();

    const newUser = {
      id: userId,
      email,
      password
    }

    users[userId] = newUser;
    res.cookie('user', users[userId]["email"]);
    res.redirect("/urls");

  } else {
    res.status(403).send("User is already registered");
  }

 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

