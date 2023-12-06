const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(cookieSession({
  name: 'session',
  keys: ["Maple syrup", "Classic poutine", "Root beer"]
}));


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

//GET the home route
app.get("/", (req, res) => {
  res.redirect('/login');
});


//display list of URLs
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id; //set user id cookie

  if (!user_id) { //check if user is not logged in
    return res.redirect('/login');
  };

  //get URLs specific to the logged in user 
  const usersUrls = urlsForUser (urlDatabase, user_id);
  const templateVars = {
    urls: usersUrls, //pass URLs
    user: users[user_id] //pass user from the object
  };

  res.render("urls_index", templateVars);
});


//display a form for creating a new URL
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect('/login');
  };

  const templateVars = {
    user: users[user_id], //pass user information from the object
  };

  res.render("urls_new", templateVars);
});


//POST route to receive the form submission of new URL
app.post("/urls", (req, res) => {
  //generate new short id for the URL using helper function
  const newShortId = generateRandomString(allCharacters, strLength);
  const newLongURL = req.body.longURL;
  const user_id = req.session.user_id;

  // save new URL to our data base
  urlDatabase[newShortId] = { longURL: newLongURL, userID: user_id };
  res.redirect('/urls');
});


//GET route to handle short urls
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


//route to display a single URL and its details
app.get("/urls/:id", (req, res) => {

  const user_id = req.session.user_id;

  //check if the user is not the owner of the URL
  if (user_id !== (urlDatabase[req.params.id] && urlDatabase[req.params.id].userID)) {
    return res.redirect('/login');
  };

  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) { //check if no long URL is found
    return res.status(404).send("No link with this ID found!");
  };
  const templateVars = {
    id: req.params.id,
    longURL,
    user: users[user_id]
  };

  res.render("urls_show", templateVars);
});


//POST route for /urls/:id to update a resource
app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.newURL;
  const urlID = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) { //check if user is not logged in
    return res.status(400).send("Please log in");
  };

  if (!urlDatabase[urlID]) { 
    return res.status(403).send("No link with this ID found!");
  };

  if (urlDatabase[urlID].userID !== user_id) { // check if user owns the URL
    return res.status(403).send("You don't own this URL");
  };

  urlDatabase[urlID] = { longURL: newLongURL, userID: user_id };

  res.redirect("/urls");
});


//POST route that removes a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) { //check if user is not logged in
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

  if (users[user_id]) {
    return res.redirect('/urls');
  };

  const templateVars = {
    user: user_id,
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

  if (user.email !== email || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect email or password");
  };

  //happy path
  req.session.user_id = user.id;
  res.redirect("/urls");

});

app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(400).send('User is not logged in!');
  };
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id],
  };
  res.render('urls_index', templateVars);
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


//POST route to handle a registration page
app.post("/register", (req, res) => {
  //generate random user id using helper function
  const userId = generateRandomString(allCharacters, strLength);
  const email = req.body.email;
  const password = req.body.password;

  //generate a salt and hash the password using bcrypt for security
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);

  if (!email || !password) { 
    return res.status(400).send("Provide email and a password");
  };

  //lookup the user based on provided email
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("The user with such an email already exists");
  };

  //Passing a new user into to users object
  users[userId] = { id: userId, email: email, password: hashed }; //add use to database

  req.session.user_id = userId;  //setting the user id cookies

  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});