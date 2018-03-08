var datastoreSvc = require("../services/datastoreService");
var valUtil = require("../utils/validation");
var expenseRecordFactory = require("./models/expenseRecord");

exports.getDepoMngAccAndPreselect = async function(ownerId) {
  return new Promise((resolve, reject) => {
    datastoreSvc.queryDepoMngAccAndPreselect(ownerId).then((dbData) => {
      let groupedData = {
        depos: [],
        mngAccs: [],
        userPref: {}
      };
      dbData.forEach(function(entry) {
        let type = entry.bookkeeping.type;
        if(type == "depo") {
          groupedData.depos.push(entry.bookkeeping);
        } else if(type == "mngAcc") {
          groupedData.mngAccs.push(entry.bookkeeping);
        } else if(type == "user") {
          groupedData.userPref = entry.bookkeeping;
        }
      });
      resolve(groupedData);
    })
    .catch((err) => {
      console.log(err);
    });
  });
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
