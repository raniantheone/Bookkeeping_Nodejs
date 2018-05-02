let config = require("./sysConfig_default");

config.couchbase.bucket.name = "bookkeeping_staging";
config.couchbase.bucket.acc = "dev";
config.couchbase.bucket.pwd = "devpassword";

module.exports = config;
