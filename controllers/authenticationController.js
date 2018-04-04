var cls = require('cls-hooked');
var logUtil = require("../utils/customLogger");
var logger = logUtil.logger;
var authenProc = require("../businessProcesses/authenticationProcess");
var vldUtil = require("../utils/validation");
var config = require("../config/sysConfig");


// check if the request is from a valid user, return only when check failed, otherwise pass req to next controller
exports.authenticationGuard = async function(req, res, next) {
  logger.info("controller authenticationGuard invoked");
  let cookies = req.cookies;
  let respContent = {
    authenError: null
  };
  if(Object.keys(cookies).length > 0 && cookies.accessToken && cookies.user) {
    let isValid = await authenProc.checkAccessData(cookies.accessToken, cookies.user);
    if(isValid) {
      next(); // TODO refresh client cookie expiration
      return;
    }
  };
  respContent.authenError = "Auth cookie is not valid";
  res.json(respContent);
};

exports.login = async function(req, res) {

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };

  try {

    logger.info("controller login invoked");
    console.log(cls.getNamespace("testReqScope"));

    // TODO email format, length, special character validation
    var ownerIdGuard = vldUtil.createGuard(
      vldUtil.isNotEmpty
      , "ownerId is not empty"
      , "ownerId is empty"
      , req.body.ownerId
    );
    var passwordGuard = vldUtil.createGuard(
      vldUtil.isNotEmpty
      , "password is not empty"
      , "password is empty"
      , req.body.password
    );
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard,
      passwordGuard
    ]);

    if(checkResult.allValidated) {
      let ownerId = req.body.ownerId;
      let password = req.body.password;
      let isValid = await authenProc.isValidUser(ownerId, password);
      if(isValid) {
        let accessData = await authenProc.buildAccessData(ownerId, password);
        res.cookie("accessToken", accessData.token, { maxAge: config.authenMaxAgeSec * 1000 });
        res.cookie("user", req.body.ownerId, { maxAge: config.authenMaxAgeSec * 1000 });
        respContent.payload = true;
      }else{
        respContent.payload = false;
      }
    }else{
      respContent.payload = checkResult.allGuards.filter(function(guard) {
        return !guard.isValid;
      }).map((guard) => {
        return guard.resultMsg
      });
    }

  } catch(err) {
    console.log(err);
    respContent.isSuccess = false;
    respContent.error = err;
  }
  res.json(respContent);
}

exports.checkAuthenStat = async function(req, res) {
  logger.info("controller checkAuthenStat invoked");
  let cookies = req.cookies;
  let respContent = {
    authenIsValid: false
  };
  if(cookies.accessToken && cookies.user) {
    respContent.authenIsValid = await authenProc.checkAccessData(cookies.accessToken, cookies.user);
  };
  res.json(respContent);
}
