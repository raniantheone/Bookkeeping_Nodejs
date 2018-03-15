var datastoreSvc = require("../services/datastoreService");
var valUtil = require("../utils/validation");
var expenseRecordFactory = require("./models/expenseRecord");

exports.getInitDepoMngAccAndPref = async function(ownerId) {
  var initializedDepoMngAccAndUserPref = {
    availCombination: [],
    userPref: {}
  };
  try {

    var queryResultArr = await Promise.all([
      datastoreSvc.queryExistingUser(ownerId),
      datastoreSvc.queryDepoMngAccWithInitValue(ownerId)
    ]);

    var user = queryResultArr[0];
    initializedDepoMngAccAndUserPref.userPref = user.prefs || {};

    var initAndMappingDataArr = queryResultArr[1];
    var depoMap = {};
    var mngAccMap = {};
    for(let entry of initAndMappingDataArr) {
      if(entry.type == "depo") {
        depoMap[ entry.id ] = entry.displayName;
      }else if(entry.type == "mngAcc") {
        mngAccMap[ entry.id ] = entry.displayName;
      }else if(entry.type == "income" && entry.transType == "init") {
        var combo = {
          depoId: entry.depo,
          depoDisplayName: null,
          mngAccId: entry.mngAcc,
          mngAccDisplayName: null
        };
        initializedDepoMngAccAndUserPref.availCombination.push(combo);
      }
    }
    initializedDepoMngAccAndUserPref.availCombination.forEach((combo) => {
      combo.depoDisplayName = depoMap[combo.depoId];
      combo.mngAccDisplayName = mngAccMap[combo.mngAccId];
    });

  } catch(err) {
    console.log(err + " <-- err happend; process layer - getInitDepoMngAccAndPref consumes it and returns default value");
  }
  return initializedDepoMngAccAndUserPref;
}

exports.saveExpenseRecord = async function(clientExpenseRecord) {

  var recordOwnerId = clientExpenseRecord.depo.split("::")[0];

  return new Promise((resolve, reject) => {
    var expenseRecord = expenseRecordFactory.buildExpenseRecord(
      recordOwnerId,
      [],
      [],
      clientExpenseRecord.itemName,
      clientExpenseRecord.itemDesc,
      clientExpenseRecord.transAmount,
      new Date(clientExpenseRecord.transDateTime),
      clientExpenseRecord.transType,
      clientExpenseRecord.transIssuer,
      clientExpenseRecord.depo,
      clientExpenseRecord.mngAcc
    );
    console.log(expenseRecord);
    resolve(datastoreSvc.insertExpenseRecord(expenseRecord));
  });
}

exports.asyncKeepFreqExpenseDepoMngAccPref = async function(ownerId, preferredDepo, preferredMngAcc) {
  return new Promise((resolve, reject) => {
    try {
      var userPrefArr = [];
      if(preferredDepo) {
        userPrefArr.push({ preferredDepo: preferredDepo });
      };
      if(preferredMngAcc) {
        userPrefArr.push({ preferredMngAcc: preferredMngAcc });
      }
      resolve(datastoreSvc.saveUserPrefs(ownerId, userPrefArr));
    } catch(err) {
      reject(err);
    }
  });
}

exports.isValidExpenseTransType = async function(transType) {
  var availableExpenseTransTypes = await datastoreSvc.queryExpenseTransTypes();
  return valUtil.isWithinValSet(transType, availableExpenseTransTypes);
}

exports.expenseIssuerExists = async function(transIssuer) {
  var transIssuerUserData = null;
  var result = false;
  try {
    transIssuerUserData = await datastoreSvc.queryExistingUser(transIssuer);
    result = transIssuerUserData != null ?
      transIssuerUserData.ownerId == transIssuer
      : false;
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  console.log(transIssuer + " exists? " + result);
  return result;
}

exports.isValidDepo = async function(transIssuer, depoId) {
  var availableDepos = await datastoreSvc.queryAvailableDepos(transIssuer);
  var availableDeposIds = availableDepos.filter((depo) => {
    return true; // TODO implement owner - editor authorized behavior
  }).map((depo) => {
    return depo.id;
  });
  return valUtil.isWithinValSet(depoId, availableDeposIds);
}

exports.isValidMngAcc = async function(transIssuer, mngAccId) {
  var availableMngAccs = await datastoreSvc.queryAvailableMngAccs(transIssuer);
  var availableMngAccsIds = availableMngAccs.filter((mngAcc) => {
    return true; // TODO implement owner - editor authorized behavior
  }).map((mngAcc) => {
    return mngAcc.id;
  });
  return valUtil.isWithinValSet(mngAccId, availableMngAccsIds);
}

exports.comboIsInitializedAndAvailable = async function(transIssuer, depoId, mngAccId) {
  var isInitializedAndAvailable = false;
  try {

  } catch() {

  }
  return isInitializedAndAvailable;
}
