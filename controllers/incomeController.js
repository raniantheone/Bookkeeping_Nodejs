var incomeProc = require("../businessProcesses/incomeProcess");
var vldUtil = require("../utils/validation");

exports.getInitDepoMngAccAndPref = async function(req, res) {

  console.log("getInitDepoMngAccAndPref invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };

  try {

    var ownerIdGuard = vldUtil.createGuard(
      incomeProc.ownerIdExists
      , "owner ok"
      , "owner does not exist in system"
      , req.body.ownerId);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await incomeProc.getInitDepoMngAccPrefAndMapping(req.body.ownerId);
    } else {
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

exports.keepIncomeRecord = async function(req, res) {

  console.log("keepIncomeRecord invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };

  try {

    var itemNameGuard = vldUtil.createGuard(
      vldUtil.isNotEmpty
      , "item name ok"
      , "item name is empty"
      , req.body.itemName);
    var transAmountGuard = vldUtil.createGuard(
      vldUtil.isNumGreaterThanZero
      , "transAmount ok"
      , "transAmount is not greater than 0"
      , req.body.transAmount);
    var transDateTimeGuard = vldUtil.createGuard(
      vldUtil.isDate
      , "transDateTime ok"
      , "failed to convert transDateTime to Date obj"
      , req.body.transDateTime);
    var transIssuerGuard = vldUtil.createGuard(
      incomeProc.isValidIssuer
      , "issuer ok"
      , "issuer cannot use these depo, mngAcc"
      , req.body.transIssuer
      , req.body.depo
      , req.body.mngAcc);
    var initializationGuard = vldUtil.createGuard(
      incomeProc.isInitialized
      , "depo-mngAcc combo is initialized"
      , "depo-mngAcc combo is not initialized"
      , req.body.depo
      , req.body.mngAcc);
    var checkResult = await vldUtil.asyncGuardsCheck([
      itemNameGuard
      , transAmountGuard
      , transDateTimeGuard
      , transIssuerGuard
      , initializationGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await incomeProc.saveIncomeRecord(
        req.body.itemName
        , req.body.itemDesc
        , req.body.transAmount
        , req.body.transDateTime
        , req.body.transIssuer
        , req.body.depo
        , req.body.mngAcc
      );
    } else {
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
