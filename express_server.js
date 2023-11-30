const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//User object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



//Generate a Random Short URL ID
let allCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let strLength = 6;

const generateRandomString = function (allCharacters, strLength) {
  let randomString = '';
  for (let i = 0; i < strLength; i++) {
    let randomPosition = Math.floor(Math.random() * allCharacters.length);
    randomString += allCharacters.substring(randomPosition, randomPosition + 1);
  }
  return randomString;
};


//function to check emails in the DB
const getUserByEmail = function (email) {

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    };
  };
  return null;

}

//GET for the home route
app.get("/", (req, res) => {
  res.send("Hello!");
});


//GET for /urls route
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"]; //set user id cookie
  const templateVars = {
    urls: urlDatabase, //keep track of a URLs
    user: users[user_id], //pass user from the object
    user_id: user_id
  };
  res.render("urls_index", templateVars);
});


//GET for /urls/new route
app.get("/urls/new", (req, res) => {
  const templateVars = { //pass user name from cookies
    user_id: req.cookies["user_id"], //set user id cookie
    user: users, //pass user from the object
    longURL: urlDatabase[req.params.id] //passing the longURL to be displayed on the page
  };
  res.render("urls_new", templateVars);
});


//POST route to receive the form submission (..urls/new)
app.post("/urls", (req, res) => {
  const newShortId = generateRandomString(allCharacters, strLength);
  const newLongURL = req.body.longURL;
  //save data to our data base
  urlDatabase[newShortId] = newLongURL;
  res.redirect(`/urls`);
});


//GET route to handle short urls
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


//add new rout to display a single URL
app.get("/urls/:id", (req, res) => {

  const templateVars = {
    id: req.params.id, //id - is a rout parameter
    user_id: req.cookies["user_id"], //set user id cookie
    user: users,
    longURL: urlDatabase[req.params.id] //associated longURL with it's id
  };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//Home page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//POST route for /urls/:id to update a resource
app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.newURL;
  urlDatabase[req.params.id] = {
    longURL: newLongURL,
  }

  res.redirect("/urls");
});



//POST route that removes a URL resource
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//GET login route
app.get("/login", (req, res) => {
  const templateVars = {
    newLongURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"],
    user: users
  };
  res.render('login', templateVars);
});


//POST route to handle user login
app.post("/login", (req, res) => {
  const user_id = req.body.user_id;
  res.cookie("user_id", user_id)
  res.redirect("/urls");
});


//POST to handle user logout
app.post("/logout", (req, res) => {
  const user_id = req.body.user_id;
  const email = req.body.email;
  res.clearCookie("user_id", user_id); //Clear user id cookie on logout
  res.clearCookie("email", email); //Clear user email cookie on logout
  res.redirect("/urls");
});


//GET to handle registration
app.get("/register", (req, res) => {
  res.render("registration");
});


//POST to handle a registration
app.post("/register", (req, res) => {
  //pull data off the body object
  const newId = generateRandomString(allCharacters, strLength);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Provide email and a password");
  };

  //lookup the user based on provided email
  const foundUser = getUserByEmail(email);

  if (foundUser) {
    return res.status(400).send("The user with such an email already exists");
  };

  //Passing user into to users object
  users[newId] = { id: newId, email: email, password: password }; //add use to database
  res.cookie("user_id", newId); //set cookies
  res.cookie("email", email);
  res.redirect("/urls");
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});