/**
 * This module handles request regarding expense flow.
 * @module expenseController
 */
var expenssProc = require("../businessProcesses/expenseProcess");
var vldUtil = require("../utils/validation");
var logUtil = require("../utils/customLogger");
var logger = logUtil.logger;

exports.getAvailDepoMngAccOptForExpense = async function(req, res) {

  logger.info("getAvailDepoMngAccOptForExpense invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {
    if(vldUtil.isNotEmpty(req.body.ownerId)) {
      respContent.payload = await expenssProc.getInitDepoMngAccAndPref(req.body.ownerId);
    }
  } catch(err) {
    console.log(err);
    respContent.isSuccess = false;
    respContent.error = err;
  }
  res.json(respContent);

}

exports.keepExpenseRecord = async function(req, res) {

  console.log("keepExpenseRecord invoked");
  console.log(req.body);

  var itemNameGuard = vldUtil.createGuard(
    vldUtil.isNotEmpty
    , "item name ok"
    , "item name is empty"
    , req.body.itemName);
  var transAmountGuard = vldUtil.createGuard(
    vldUtil.isNumGreaterThanZero
    , "transAmount ok"
    , "transAmount have to be greater than 0"
    , req.body.transAmount);
  var transDateTimeGuard = vldUtil.createGuard(
    vldUtil.isDate
    , "transDateTime ok"
    , "failed to convert transDateTime to Date obj"
    , req.body.transDateTime);
  var transTypeGuard = vldUtil.createGuard(
    expenssProc.isValidExpenseTransType
    , "transType ok"
    , "transType is not within valid value set"
    , req.body.transType);
  var transIssuerGuard = vldUtil.createGuard(
    expenssProc.expenseIssuerExists
    , "issuer ok"
    , "issuer does not exist in system"
    , req.body.transIssuer);
  var depoMngAccInitializedGuard = vldUtil.createGuard(
    expenssProc.comboIsInitializedAndAvailable
    , "depo and mngAcc combination is fine"
    , "depo or mngAcc is not initialized, or the issuer do not have permission to use any"
    , req.body.transIssuer
    , req.body.depo
    , req.body.mngAcc
  );
  var checkResult = await vldUtil.asyncGuardsCheck([
    itemNameGuard,
    , transAmountGuard
    , transDateTimeGuard
    , transTypeGuard
    , transIssuerGuard
    , depoMngAccInitializedGuard
  ]);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {
    // save record
    if(checkResult.allValidated) {
      respContent.payload = await expenssProc.saveExpenseRecord(
        req.body.itemName
        , req.body.itemDesc
        , req.body.transAmount
        , req.body.transDateTime
        , req.body.transType
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

    // save preference if exist
    // as long as main process(save record) is success, the whole process is treated as completed
    if(req.body.preferredExpenseDepo || req.body.preferredExpenseMngAcc) {
      expenssProc.asyncKeepFreqExpenseDepoMngAccPref(req.body.transIssuer, req.body.preferredExpenseDepo, req.body.preferredExpenseMngAcc)
      .then((res) => {
        console.log("pref saved");
        console.log(res);
      })
      .catch((err) => {
        console.log("pref not saved");
        console.log(err);
      });
    }
  } catch(err) {
    console.log(err);
    respContent.isSuccess = false;
    respContent.error = err;
  }
  res.json(respContent);

}
