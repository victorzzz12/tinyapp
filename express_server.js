//installed modules
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//imported objects
const { urlDatabase }= require("./userDatabase");
const { users } = require("./userDatabase");
//imported functions
const { generateRandomString } = require("./helperFunctions");
const { findUserForLogin } = require("./helperFunctions");
const { findUserByEmail } = require("./helperFunctions");
const { urlsForUser } = require("./helperFunctions");


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['f080ac7b-b838-4c5f-a1f4-b0a9fee10130', 'c3fb18be-448b-4f6e-a377-49373e9b7e1a']
}));

///GET requests
app.get("/", (req, res) => {
  if (req.session["user"] === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session["user"]), user: req.session["user"] };
  if (req.session["user"] === undefined) {
    res.render("newUserPage", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {  
  if (req.session["user"] === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = { user: req.session["user"] };
    res.render("urls_new", templateVars);
  }
 
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  if (urlDatabase[shortURL] === undefined) { //Sends error if the short URL id does not exist
    res.send("This is not a valid short URL ID. Please return to the previous page.");

  } else if (req.session["user"] === undefined) { //Sends user to login page if not logged 
                                                  //in even though they have a correct short URL
    res.redirect("/login");

  } else if (req.session["user"] !== urlDatabase[shortURL]["userId"]) {
    res.send("This is link is not registered on your account.");

  } else {
    console.log(urlDatabase);
    let templateVars = { shortURL: shortURL, longURL: longURL, user: req.session["user"]};
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  if(!longURL.includes("https://")) {
    res.redirect(`https://${longURL}`);
  } else {
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.session["user"] }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.session["user"] }
  res.render("login", templateVars);
});

//POST requests


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const user = req.session["user"];
  urlDatabase[shortURL] = { longURL: req.body["longURL"], userId: user};
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.session["user"];
  urlDatabase[shortURL] = { longURL: req.body["longURL"], userId: user};
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session["user"] === urlDatabase[req.params.shortURL]["userId"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.send("Please login to delete\n");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => { //goes into the short url from the edit button
  if (req.session["user"] === undefined) {
    res.redirect("/login");
  }
  else if (req.session["user"] === urlDatabase[req.params.shortURL]["userId"]) {
    res.redirect(`/urls/${req.params.shortURL}`);
  }
  else {
    res.send("Please login to edit\n");
  }
});

app.post("/login", (req, res) => { //logins with given user
  const email = req.body.loginEmail;
  const password = req.body.loginPassword;
  const user = findUserForLogin(email, password, users);

  if (email === "" && password === "") {
    res.status(400).send("The form cannot be empty. Please return to the previous login page.");
  }
  if (user) {
    req.session['user'] = email;
    res.redirect("/urls");
  } else {
    res.send("Enter valid email and/or password. Please return to the previous login page.");
  }
});

app.post("/logout", (req, res) => { //logs out current user
  req.session["user"] = undefined;
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);

  if (email === "" && password === "") {
    res.status(400).send("The form cannot be empty. Please return to the previous registration page.");
  }

  if (!user) {
    const userId = generateRandomString();
    const newUser = {
      id: userId,
      email,
      password: bcrypt.hashSync(password, saltRounds)
    }

    users[userId] = newUser;
    req.session['user'] = users[userId]["email"];
    res.redirect("/urls");

  } else {
    res.status(403).send("User is already registered");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


