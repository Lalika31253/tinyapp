const { Template } = require("ejs");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; //keep track of a URLs
  res.render("urls_index", templateVars);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});