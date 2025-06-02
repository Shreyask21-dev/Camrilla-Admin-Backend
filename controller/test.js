const crypto = require('crypto');

function md5Hash(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

// Example
const password = '123456';
const hashed = md5Hash(password);
console.log('MD5 Hash:', hashed);
