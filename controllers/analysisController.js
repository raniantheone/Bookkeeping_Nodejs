var vldUtil = require("../utils/validation");
var analysisProc = require("../businessProcesses/analysisProcess");

exports.getBalanceDistribution = async function(req, res) {

  console.log("getBalanceDistribution invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };

  try {

    var ownerIdGuard = vldUtil.createGuard(
      analysisProc.ownerIdExists
      , "owner ok"
      , "owner does not exist in system"
      , req.body.);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await analysisProc.getBalanceOfDepoMngAcc(req.body.ownerId);
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
