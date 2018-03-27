var authenProc = require("../businessProcesses/authenticationProcess");
var vldUtil = require("../utils/validation");

// check if the request is from a valid user, return only when check failed, otherwise pass req to next controller
exports.authenticationGuard = async function(req, res, next) {
  let cookies = req.cookies;
  let respContent = {
    authenError: null
  };
  console.log(cookies);
  if(Object.keys(cookies).length > 0 && cookies.accessToken && cookies.user) {
    let isValid = await authenProc.checkAccessData(cookies.accessToken, cookies.user);
    if(isValid) {
      next();
      return;
    }
  };
  respContent.authenError = "Auth cookie is not valid";
  res.json(respContent);
};

exports.login = async function(req, res) {

  console.log("login invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };

  try {

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
      let isValid = await authenProc.isValidUser(req.body.ownerId, req.body.password);
      if(isValid) {
        let accessData = await authenProc.buildAccessData(req.body.ownerId, req.body.password);
        res.cookie("accessToken", accessData.token, { maxAge: 120000 }); // TODO test temp const
        res.cookie("user", req.body.ownerId, { maxAge: 120000 }); // TODO test temp const
        respContent.payload = true;
      }else{
        respContent.payload = "credential incorrect";
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
  let cookies = req.cookies;
  let respContent = {
    authenIsValid: false
  };
  console.log(cookies);
  if(Object.keys(cookies).length != 0) {
    respContent.authenIsValid = await authenProc.checkAccessData(cookies.accessToken, cookies.user);
  };
  res.json(respContent);
}
