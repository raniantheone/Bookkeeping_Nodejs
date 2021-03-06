let configBuilder = require("./configBuilder");
let config = configBuilder.buildConfigComponent();

config.authenMaxAgeSec = 24 * 60 * 60;
config.usePort = 3000;

config.couchbase.errorCode.noSuchKey = 13;
config.couchbase.bucket.name = "bookkeeping";
config.couchbase.bucket.acc = "Administrator";
config.couchbase.bucket.pwd = "password";

module.exports = config;
