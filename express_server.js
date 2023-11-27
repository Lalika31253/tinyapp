const { Template } = require("ejs");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

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


app.get("/", (req, res) => { //
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; //keep track of a URLs
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//POST route to receive the form submission (..urls/new)
app.post("/urls", (req, res) => {

  const newShortId = generateRandomString(allCharacters, strLength);
  const newLongURL = req.body.longURL;

  //save data to our data base
  urlDatabase[newShortId] = newLongURL;
  // const templateVars = {
  //   id: newShortId,
  //   longURL: newLongURL
  // }
  //console.log(req.body.longURL);
  //console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls`); 
});


//GET route to handle short urls
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log("Long URL: id", longURL);
  res.redirect(longURL);
});



//add new rout to display a single URL
app.get("/urls/:id", (req, res) => {

  const templateVars = {
    id: req.params.id, //id - is a rout parameter
    longURL: urlDatabase[req.params.id] //associated longURL with it's id
  };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Add POST route for /urls/:id to update a resource
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});

//Add a POST route that removes a URL resource
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
    res.redirect("/urls");
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});