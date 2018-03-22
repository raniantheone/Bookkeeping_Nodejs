var datastoreSvc = require("../services/datastoreService");
var valUtil = require("../utils/validation");
var depoFactory = require("./models/depository");
var mngAccFactory = require("./models/managingAccount");
var incomeRecordFactory = require("./models/incomeRecord");

exports.ownerIdExists = async function(ownerId) {
  var isValidUser = false;
  var validUser = null;
  try {
    validUser = await datastoreSvc.queryExistingUser(ownerId);
    isValidUser = validUser != null ?
      validUser.ownerId == ownerId
      : false;
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  console.log(ownerId + " is a valid user? " + isValidUser);
  return isValidUser;
}

exports.findCurrentDepoMngAccWithInitValue = async function(ownerId) {

  var dataPackage = {
    depos: [],
    mngAccs: [],
    initialized: [] // {depoId: str, mngAccId: str, initVal: num}
  };
  try {
    var depoMngAccWithInitValue = await datastoreSvc.queryDepoMngAccWithInitValue(ownerId);
    depoMngAccWithInitValue.forEach((entry) => {
      if(entry.type == "depo") {
        dataPackage.depos.push(entry);
      }else if(entry.type == "mngAcc") {
        dataPackage.mngAccs.push(entry);
      }else if(entry.type == "income" && entry.transType == "init") {
        dataPackage.initialized.push({
          depoId: entry.depo,
          mngAccId: entry.mngAcc,
          initValue: entry.transAmount
        });
      }
    });
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  return dataPackage;

}

exports.addDepo = async function(ownerId, displayName) {
  var depo = depoFactory.buildDepository(ownerId, displayName, [], []);
  return await datastoreSvc.createDepo(depo); // let controller handler the error if db service fails
}

exports.ownerHasTheDepo = async function(ownerId, depoId) {
  var ownerHasIt = false;
  try {
    var depo = await datastoreSvc.queryDepoById(depoId);
    ownerHasIt = (depo != null && depo.ownerId == ownerId);
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  return ownerHasIt;
}

async function displayNameIsNotTaken(ownerId, displayName, type) {
  console.log("displayNameIsNotTaken: " + type + " - " + displayName + " by " + ownerId)
  var isNotTaken = false;
  try {
    var depoMngAccWithInitValue = await datastoreSvc.queryDepoMngAccWithInitValue(ownerId);
    var targetTypeWithSameDisplayName = depoMngAccWithInitValue.filter((entry) => {
      console.log(entry.displayName);
      return entry.type == type && entry.displayName == displayName;
    });
    console.log(targetTypeWithSameDisplayName);
    isNotTaken = targetTypeWithSameDisplayName.length == 0;
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  return isNotTaken;
}

exports.depoDisplayNameIsNotTaken = async function(ownerId, displayName) {
  return displayNameIsNotTaken(ownerId, displayName, "depo");
}

exports.mngAccDisplayNameIsNotTaken = async function(ownerId, displayName) {
  return displayNameIsNotTaken(ownerId, displayName, "mngAcc");
}

exports.changeDepoDisplayName = async function(ownerId, depoId, displayName) {
  var operSuccess = false;
  try {
    operSuccess = await datastoreSvc.updateDepoName(ownerId, depoId, displayName);
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  return operSuccess;
}

exports.deleteDepo = async function(ownerId, depoId) {
  var operSuccess = false;
  try {
    operSuccess = await datastoreSvc.delDepo(ownerId, depoId);
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  return operSuccess;
}

exports.addMngAcc = async function(ownerId, displayName) {
  var mngAcc = mngAccFactory.buildManagingAccount(ownerId, displayName, [], []);
  return await datastoreSvc.createMngAcc(mngAcc); // let controller handler the error if db service fails
}

exports.ownerHasTheMngAcc = async function(ownerId, mngAccId) {
  var ownerHasIt = false;
  try {
    var mngAcc = await datastoreSvc.queryMngAccById(mngAccId);
    ownerHasIt = (mngAcc != null && mngAcc.ownerId == ownerId);
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  console.log("owner: " + ownerId + " has mngAcc: " + mngAccId + " ? " + ownerHasIt);
  return ownerHasIt;
}

exports.changeMngAccDisplayName = async function(ownerId, mngAccId, displayName) {
  var operSuccess = false;
  try {
    operSuccess = await datastoreSvc.updateMngAccName(ownerId, mngAccId, displayName);
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  return operSuccess;
}

exports.deleteMngAcc = async function(ownerId, mngAccId) {
  var operSuccess = false;
  try {
    operSuccess = await datastoreSvc.delMngAcc(ownerId, mngAccId);
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  return operSuccess;
}

exports.initDepoMngAcc = async function(ownerId, depoId, mngAccId, initAmount) {
  var operSuccess = false;
  try {
    var initRecord = incomeRecordFactory.buildIncomeRecord(
      ownerId,
      [],
      [],
      "init",
      "",
      initAmount,
      new Date(),
      "init", // transType constant for init record
      ownerId,
      depoId,
      mngAccId
    );
    await datastoreSvc.deleteInitRecord(ownerId, depoId, mngAccId); // only keep one init record for a depo-mngAcc combination
    // TODO need rollback logic here, in case the deletion above succeded but insertion below failed
    operSuccess = await datastoreSvc.insertIncomeRecord(initRecord);
  } catch(err) {
    console.log(err + " <-- happened, configProcess consumed the error and returned default value");
  }
  return operSuccess;
}

exports.delInitCombo = async function(ownerId, depoId, mngAccId) {
  var operSuccess = false;
  try {
    operSuccess = await datastoreSvc.deleteInitRecord(ownerId, depoId, mngAccId);
  } catch(err) {
    console.log(err + " <-- happened, configProcess.delInitCombo consumed the error and returned default value");
  }
  return operSuccess;
}

exports.depoIsNotInUse = async function(ownerId, depoId) {
  var isNotInUse = false;
  try {
    var initRecords = await datastoreSvc.queryInitIncomeRecord(ownerId);
    isNotInUse = initRecords.filter((record) => { return record.depo == depoId }).length == 0;
  } catch(err) {
    console.log(err + " <-- happened, configProcess.depoIsNotInUse consumed the error and returned default value");
  }
  return isNotInUse;
}

exports.mngAccIsNotInUse = async function(ownerId, mngAccId) {
  var isNotInUse = false;
  try {
    var initRecords = await datastoreSvc.queryInitIncomeRecord(ownerId);
    isNotInUse = initRecords.filter((record) => { return record.mngAcc == mngAccId }).length == 0;
  } catch(err) {
    console.log(err + " <-- happened, configProcess.depoIsNotInUse consumed the error and returned default value");
  }
  return isNotInUse;
}
