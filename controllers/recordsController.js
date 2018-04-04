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
    var pageNumGuard = vldUtil.createGuard(
      vldUtil.isNumGreaterThanZero
      , "page number is OK"
      , "page number is not greater than 0"
      , req.body.page
    );
    var entriesNumGuard = vldUtil.createGuard(
      vldUtil.isNumGreaterThanZero
      , "entries per page is OK"
      , "entries per page is not greater than 0"
      , req.body.entriesPerPage
    );
    var checkResult = await vldUtil.asyncGuardsCheck([
      transIssuerGuard
      , pageNumGuard
      , entriesNumGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await recordsProc.searchMatchedRecords(
        req.body.startTime
        , req.body.endTime
        , req.body.ownerId
        , req.body.transIssuer
        , Math.floor(req.body.page)
        , Math.floor(req.body.entriesPerPage)
        , req.body.getCount
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
