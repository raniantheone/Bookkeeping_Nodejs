// var md5 = require("md5");
// TODO Add md5 method for password hashing

exports.simpleHash = function(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return (hash >>> 0);
};
