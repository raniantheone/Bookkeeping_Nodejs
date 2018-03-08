var configProc = require("../businessProcesses/configProcess");
var vldUtil = require("../utils/validation");

exports.getCurrentDepoMngAccWithInitValue = async function(req, res) {

  console.log("getCurrentDepoMngAccWithInitValue invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {
    if(vldUtil.isNotEmpty(req.body.ownerId) && await configProc.ownerIdExists(req.body.ownerId)) {
      respContent.payload = await configProc.findCurrentDepoMngAccWithInitValue(req.body.ownerId);
    }
  } catch(err) {
    console.log(err);
    respContent.isSuccess = false;
    respContent.error = err;
  }
  res.json(respContent);

}

exports.addDepository = async function(req, res) {

  console.log("addDepository invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {

    var ownerIdGuard = vldUtil.createGuard(
      configProc.ownerIdExists
      , "ownerId ok"
      , "ownerId does not exist"
      , req.body.ownerId);
    var displayNameGuard = vldUtil.createGuard(
      vldUtil.isNotEmpty
      , "displayName ok"
      , "displayName is empty"
      , req.body.displayName);
    var uniqueDisplayNameGuard = vldUtil.createGuard(
      configProc.depoDisplayNameIsNotTaken
      , "depo name is available"
      , "this owner already has a depo with same name"
      , req.body.ownerId
      , req.body.displayName);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard,
      displayNameGuard,
      uniqueDisplayNameGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await configProc.addDepo(req.body.ownerId, req.body.displayName);
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

exports.editDepository = async function(req, res) {

  console.log("editDepository invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {

    var ownerIdGuard = vldUtil.createGuard(
      configProc.ownerIdExists
      , "ownerId exists"
      , "ownerId does not exist"
      , req.body.ownerId);
    var depoIdGuard = vldUtil.createGuard(
      configProc.ownerHasTheDepo
      , "owner have this depo"
      , "owner does not have this depo"
      , req.body.ownerId
      , req.body.depoId);
    var displayNameGuard = vldUtil.createGuard(
      configProc.depoDisplayNameIsNotTaken
      , "displayName ok"
      , "displayName is taken"
      , req.body.ownerId
      , req.body.displayName);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard,
      depoIdGuard,
      displayNameGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await configProc.changeDepoDisplayName(req.body.ownerId, req.body.depoId, req.body.displayName);
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

exports.deleteDepository = async function(req, res) {

  console.log("deleteDepository invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {

    var ownerIdGuard = vldUtil.createGuard(
      configProc.ownerIdExists
      , "ownerId exists"
      , "ownerId does not exist"
      , req.body.ownerId);
    var depoIdGuard = vldUtil.createGuard(
      configProc.ownerHasTheDepo
      , "owner have this depo"
      , "owner does not have this depo"
      , req.body.ownerId
      , req.body.depoId);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard,
      depoIdGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await configProc.deleteDepo(req.body.ownerId, req.body.depoId);
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

exports.addManagingAccount = async function(req, res) {

  console.log("addManagingAccount invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {

    var ownerIdGuard = vldUtil.createGuard(
      configProc.ownerIdExists
      , "ownerId ok"
      , "ownerId does not exist"
      , req.body.ownerId);
    var displayNameGuard = vldUtil.createGuard(
      vldUtil.isNotEmpty
      , "displayName ok"
      , "displayName is empty"
      , req.body.displayName);
    var uniqueDisplayNameGuard = vldUtil.createGuard(
      configProc.mngAccDisplayNameIsNotTaken
      , "mngAcc name is available"
      , "this owner already has a mngAcc with same name"
      , req.body.ownerId
      , req.body.displayName);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard,
      displayNameGuard,
      uniqueDisplayNameGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await configProc.addMngAcc(req.body.ownerId, req.body.displayName);
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

exports.editManagingAccount = async function(req, res) {

  console.log("editManagingAccount invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {

    var ownerIdGuard = vldUtil.createGuard(
      configProc.ownerIdExists
      , "ownerId exists"
      , "ownerId does not exist"
      , req.body.ownerId);
    var mngAccIdGuard = vldUtil.createGuard(
      configProc.ownerHasTheMngAcc
      , "owner have this mngAcc"
      , "owner does not have this mngAcc"
      , req.body.ownerId
      , req.body.mngAccId);
    var displayNameGuard = vldUtil.createGuard(
      configProc.mngAccDisplayNameIsNotTaken
      , "displayName ok"
      , "displayName is taken"
      , req.body.ownerId
      , req.body.displayName);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard,
      mngAccIdGuard,
      displayNameGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await configProc.changeMngAccDisplayName(req.body.ownerId, req.body.mngAccId, req.body.displayName);
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

exports.deleteManagingAccount = async function(req, res) {

  console.log("deleteManagingAccount invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {

    var ownerIdGuard = vldUtil.createGuard(
      configProc.ownerIdExists
      , "ownerId exists"
      , "ownerId does not exist"
      , req.body.ownerId);
    var mngAccIdGuard = vldUtil.createGuard(
      configProc.ownerHasTheMngAcc
      , "owner have this mngAcc"
      , "owner does not have this mngAcc"
      , req.body.ownerId
      , req.body.mngAccId);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard,
      mngAccIdGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await configProc.deleteMngAcc(req.body.ownerId, req.body.mngAccId);
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

exports.initializeDepositoryManagingAccount = async function(req, res) {

  console.log("initializeDepositoryManagingAccount invoked");
  console.log(req.body);

  var respContent = {  // TODO try to make it a module, error as well
    payload : null,
    isSuccess : true,
    error : null
  };
  try {

    var ownerIdGuard = vldUtil.createGuard(
      configProc.ownerIdExists
      , "ownerId exists"
      , "ownerId does not exist"
      , req.body.ownerId);
    var depoIdGuard = vldUtil.createGuard(
      configProc.ownerHasTheDepo
      , "owner have this depo"
      , "owner does not have this depo"
      , req.body.ownerId
      , req.body.depoId);
    var mngAccIdGuard = vldUtil.createGuard(
      configProc.ownerHasTheMngAcc
      , "owner have this mngAcc"
      , "owner does not have this mngAcc"
      , req.body.ownerId
      , req.body.mngAccId);
    var initAmountGuard = vldUtil.createGuard(
      vldUtil.isNumGreaterThanZero
      , "initial amount is greater than zero"
      , "initial amount is not greater than zero"
      , req.body.initAmount);
    var checkResult = await vldUtil.asyncGuardsCheck([
      ownerIdGuard,
      depoIdGuard,
      mngAccIdGuard,
      initAmountGuard
    ]);

    if(checkResult.allValidated) {
      respContent.payload = await configProc.initDepoMngAcc(req.body.ownerId, req.body.depoId, req.body.mngAccId, req.body.initAmount);
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
