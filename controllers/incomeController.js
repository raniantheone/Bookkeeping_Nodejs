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















exports.getDynamicInitData = async function(req, res) {

  console.log("getDynamicInitData invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {
    if(vldUtil.isNotEmpty(req.body.ownerId)) {
      respContent.payload = await expenssProc.getDepoMngAccAndPreselect(req.body.ownerId);
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
    , "transAmount is smaller than 1"
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
  var depoGuard = vldUtil.createGuard(
    expenssProc.isValidDepo
    , "depo ok"
    , "depo is not within valid depo set"
    , req.body.transIssuer
    , req.body.depo);
  var mngAccGuard = vldUtil.createGuard(
    expenssProc.isValidMngAcc
    , "mngAcc ok"
    , "mngAcc is not within valid mngAcc set"
    , req.body.transIssuer
    , req.body.mngAcc);
  var checkResult = await vldUtil.asyncGuardsCheck([
    itemNameGuard,
    transAmountGuard,
    transDateTimeGuard,
    transTypeGuard,
    transIssuerGuard,
    depoGuard,
    mngAccGuard
  ]);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {
    // save record
    if(checkResult.allValidated) {
      respContent.payload = await expenssProc.saveExpenseRecord(req.body);
    } else {
      respContent.payload = checkResult.allGuards.filter(function(guard) {
        return !guard.isValid;
      }).map((guard) => {
        return guard.resultMsg
      });
    }

    // save preference if exist
    // as long as main process(save record) is success, the whole process is treated as completed
    if(req.body.preferredDepo || req.body.preferredMngAcc) {
      expenssProc.asyncKeepFreqExpenseDepoMngAccPref(req.body.transIssuer, req.body.preferredDepo, req.body.preferredMngAcc)
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
