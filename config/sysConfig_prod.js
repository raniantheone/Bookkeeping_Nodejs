let config = require("./sysConfig_default");

config.usePort = 3000; // redirect port 80 to port 3000 on production env

config.couchbase.bucket.name = "bookkeeping";
config.couchbase.bucket.acc = "admin";
config.couchbase.bucket.pwd = "projadminpassword";

module.exports = config;
