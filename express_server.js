const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const morgan = require('morgan');

const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(cookieSession({
  name: 'session',
  keys: ["Maple syrup", "Classic poutine", "Root beer"]
}))


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


//User object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@example.com",
    password: "111",
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
    if (users[userId].email === email) {
      return users[userId];
    };
  };
  return null;
}

const urlsForUser = function (urlDatabase, id) {
  const newDB = {};

  const user_id = req.cookies.user_id; //set user id cookie
  for (let URL in urlDatabase) {
    const userID = urlDatabase[URL].userID;
    if (userID === user_id) {
      newDB[URL] = urlDatabase[URL];
    };
  };
  return newDB;
};

//GET the home route
app.get("/", (req, res) => {
  res.send("Hello!");
});


//display list of URLs
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id; //set user id cookie

  const templateVars = {
    urls: urlDatabase, //keep track of a URLs
    user: users[user_id],
    user_id: req.session.user_id
  };

  res.render("urls_index", templateVars);
});


//display a form for creating a new URL
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect('/login');
  };

  const templateVars = { //pass user name from cookies
    user_id: req.session.user_id,
    user: users[user_id], //pass user from the object
  };

  res.render("urls_new", templateVars);
});


//POST route to receive the form submission of new URL
app.post("/urls", (req, res) => {
  const newShortId = generateRandomString(allCharacters, strLength);
  const newLongURL = req.body.longURL;
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect('/login');
  };

  //save data to our data base
  urlDatabase[newShortId] = { longURL: newLongURL, userID: user_id };
  res.redirect('/urls');
});


//GET route to handle short urls
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});


//rout to display a single URL and its details
app.get("/urls/:id", (req, res) => {

  const user_id = req.session.user_id;

  if (!user_id) { // check if user is logged in or not
    return res.redirect('/login');
  };

  const templateVars = {
    id: req.params.id, //id - is a rout parameter
    user_id: req.session.user_id, //set user id cookie
    user: users,
    longURL: urlDatabase[req.params.id].longURL //associated longURL with it's id
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
  const urlID = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) { //check if user is logged in
    return res.status(400).send("Please log in");
  };

  if (!urlDatabase[urlID]) { //check if URL ID exists in DB
    return res.status(404).send("URL ID not found");
  };

  if (urlDatabase[urlID].userID !== user_id) { // check if user owns the URL
    return res.status(403).send("You don't own this URL");
  };

  //update
  urlDatabase[urlID] = { longURL: newLongURL, userID: user_id };

  res.redirect("/urls");
});



//POST route that removes a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) { //check if user is logged in
    return res.status(400).send("Please log in");
  };

  if (!urlDatabase[urlID]) { //check if URL ID exists in DB
    return res.status(404).send("URL ID not found");
  };

  if (urlDatabase[urlID].userID !== user_id) { // check if user owns the URL
    return res.status(403).send("You don't own this URL");
  };

  delete urlDatabase[urlID];
  res.redirect("/urls");
});


//GET login route
app.get("/login", (req, res) => {

  const user_id = req.session.user_id;
  if (user_id) {
    return res.redirect('/urls');
  };
  const templateVars = {
    user: null,
  };

  res.render('login', templateVars);
});


//POST route to handle user login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //lookup the user based on provided email
  const user = getUserByEmail(email, users);

  if (!email || !password) {
    return res.status(403).send("Provide email and a password");
  };

  if (!user) {
    return res.status(400).send("No user with this email");
  };

  if (user.email !== email && !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect email or password");
  };

  //happy path
  req.session.user_id = user.id;
  res.redirect("/urls");

});


//POST to handle user logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


//GET to handle registration page
app.get("/register", (req, res) => {

  const user_id = req.session.user_id;

  if (user_id) {
    return res.redirect('/urls');
  };
  const templateVars = {
    user: null
  };

  res.render("registration", templateVars);
});


//POST to handle a registration page
app.post("/register", (req, res) => {
  //pull data off the body object
  const userId = generateRandomString(allCharacters, strLength);
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);

  if (!email || !password) {
    return res.status(400).send("Provide email and a password");
  };

  //lookup the user based on provided email
  const user = getUserByEmail(email);

  if (user) {
    return res.status(400).send("The user with such an email already exists");
  };

  //Passing user into to users object
  users[userId] = { id: userId, email: email, password: password }; //add use to database

  const newUser = {
    id: userId,
    email: email,
    password: hashed
  };

  users[userId] = newUser; //update users object

  req.session.user_id = userId;  //sett the user id cookies

  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});