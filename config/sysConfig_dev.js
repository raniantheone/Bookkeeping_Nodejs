let config = require("./sysConfig_default");

config.couchbase.bucket.name = "bookkeeping";
config.couchbase.bucket.acc = "Administrator";
config.couchbase.bucket.pwd = "password";

module.exports = config;
