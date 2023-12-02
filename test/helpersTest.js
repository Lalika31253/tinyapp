const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@example.com",
    password: "111",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//Generate a Random Short URL ID
let allCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let strLength = 6;

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("a@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null for non-existing email', function () {
    const user = getUserByEmail("something@example.com", testUsers);
    assert.isNull(user);
  });

  describe('generateRandomString', function () {
    it('should generate an six digit alpanumeric string', function () {
      const alphanumString = generateRandomString(allCharacters, strLength);
      assert.strictEqual(alphanumString.length, 6);
    });
  });

  describe('urlsForUser', function () {
    it('Should return an empty object if there is no user id in the DB', function () {
      const randomUserId = 'aJ10lW"';
      const userUrls = urlsForUser(testUrlDatabase, randomUserId);
      assert.deepEqual(userUrls, {});
    });
  });


});

