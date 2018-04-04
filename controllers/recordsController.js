var cls = require('cls-hooked');
var recordsProc = require("../businessProcesses/recordsProcess");
var logUtil = require("../utils/customLogger");
var logger = logUtil.logger;
var vldUtil = require("../utils/validation");
var config = require("../config/sysConfig");

exports.checkRecords = async function(req, res) {

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };

  try {

    logger.info("controller checkRecords invoked");

    var transIssuerGuard = vldUtil.createGuard(
      recordsProc.transIssuerExists
      , "transIssuer is OK"
      , "transIssuer does not exist"
      , req.body.transIssuer
    );
    var checkResult = await vldUtil.asyncGuardsCheck([transIssuerGuard]);

    if(checkResult.allValidated) {
      respContent.payload = await recordsProc.searchMatchedRecords(
        req.body.startTime
        , req.body.endTime
        , req.body.ownerId
        , req.body.transIssuer
      );
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
