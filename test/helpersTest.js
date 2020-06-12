const { assert } = require('chai');
const { users } = require("../userDatabase");
const { findUserByEmail } = require("../helperFunctions");

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", users);
    const expectedOutput = "userRandomID";
    
    assert.equal(user, expectedOutput);
  });

  it('should return false with invalid email', function() {
    const user = findUserByEmail("hahaha@hotmail.com", users);
    const expectedOutput = false;
    
    assert.equal(user, expectedOutput);
  });
});
