var cls = require('cls-hooked');
var datastoreSvc = require("../services/datastoreService");
var userFactory = require("../businessProcesses/models/user");
var hashUtil = require("../utils/hash");
var logUtil = require("../utils/customLogger");
var logger = logUtil.logger;

exports.isValidUser = async function(ownerId, password) {
  logger.info("isValidUser invoked " + cls.getNamespace("testReqScope").get("reqId"));
  console.log(cls.getNamespace("testReqScope"));
  let isValid = false;
  try {
    let user = await datastoreSvc.queryExistingUser(ownerId);
    isValid = password == user.password; // TODO hash
  } catch(err) {
    console.log(err + " <-- happened, authenProcess consumed the error and returned default value");
  }
  // logger.info("isValidUser? " + isValid);
  return isValid;
};

exports.buildAccessData = async function(ownerId, password) {
  logger.info("buildAccessData invoked");
  let accessData = {
    token: null,
    maxAge: null
  };
  try {
    accessData.token = hashUtil.simpleHash(ownerId + password + new Date().toISOString());
    accessData.maxAge = 120;
    accessData.type = "token";
    accessData.ownerId = ownerId;
    await datastoreSvc.insertAccessData(accessData);
  } catch(err) {
    console.log(err + " <-- happened, throw it to controller");
    throw(err);
  }
  return accessData;
};

exports.checkAccessData = async function(accessToken, user) {
  logger.info("checkAccessData invoked");
  let isValid = false;
  try {
    let accessData = await datastoreSvc.queryAccessData(accessToken);
    isValid = accessData != null && accessData.ownerId == user;
    console.log("checkAccessData, isValid? %s ", isValid)
  } catch(err) {
    console.log(err + " <-- happened, authenProcess consumed the error and returned default value");
  };
  return isValid;
};
