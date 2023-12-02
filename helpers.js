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
const getUserByEmail = function (email, users) {

  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    };
  };
  return null;
}

const urlsForUser = function (urlDatabase, id) {
  const newDB = {};

  //const user_id = req.cookies.user_id; //set user id cookie
  for (let URL in urlDatabase) {
    const userID = urlDatabase[URL].userID;
    if (userID === id) {
      newDB[URL] = urlDatabase[URL];
    };
  };
  return newDB;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };