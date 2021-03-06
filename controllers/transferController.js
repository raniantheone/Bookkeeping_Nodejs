var vldUtil = require("../utils/validation");
var transferProc = require("../businessProcesses/transferProcess");

exports.getTransferableDepoMngAcc = async function(req, res) {

  console.log("getTransferableDepoMngAcc invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };

  try {

    var ownerIdGuard = vldUtil.createGuard(
      transferProc.ownerIdExists
      , "owner ok"
      , "owner does not exist in system"
      , req.body.ownerId);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await transferProc.getInitDepoMngAccWithBalance(req.body.ownerId);
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

exports.transferAmount = async function(req, res) {

  console.log("transferAmount invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };

  try {

    var ownerIdGuard = vldUtil.createGuard(
      transferProc.ownerIdExists
      , "owner ok"
      , "owner does not exist in system"
      , req.body.ownerId);
    var duplicationGuard = vldUtil.createGuard(
      (sourceDepoId, sourceMngAccId, targetDepoId, targetMngAccId) => {
        return (sourceDepoId != targetDepoId) || (sourceMngAccId != targetMngAccId);
      }
      , "source is different from target"
      , "source and target are the same"
      , req.body.sourceDepo
      , req.body.sourceMngAcc
      , req.body.targetDepo
      , req.body.targetMngAcc
    );
    var amtSourceTargetInitGuard = vldUtil.createGuard(
      transferProc.isValidAmtFromSourceToTargetOfTheOwner
      , "Amount ok, source and target are initialized by the owner"
      , "Amount not within valid range, or source and target are not initialized by the owner"
      , req.body.ownerId
      , req.body.sourceDepo
      , req.body.sourceMngAcc
      , req.body.targetDepo
      , req.body.targetMngAcc
      , req.body.transAmount);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard
      , duplicationGuard
      , amtSourceTargetInitGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await transferProc.transferFromSourceToTarget(req.body.ownerId, req.body.sourceDepo, req.body.sourceMngAcc, req.body.targetDepo, req.body.targetMngAcc, req.body.transAmount);
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
