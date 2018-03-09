var vldUtil = require("../utils/validation");
var transferProc = require("../businessProcesses/incomeProcess");

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
