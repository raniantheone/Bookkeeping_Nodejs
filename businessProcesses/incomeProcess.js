var datastoreSvc = require("../services/datastoreService");
var incomeRecordFactory = require("../businessProcesses/models/incomeRecord");

exports.ownerIdExists = async function(ownerId) {
  var itExists = false;
  try {
    var user = await datastoreSvc.queryExistingUser(ownerId);
    itExists = (user != null && user.ownerId == ownerId);
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  console.log("%s exists in the system? %s", ownerId, itExists);
  return itExists;
}

exports.getInitDepoMngAccPrefAndMapping = async function(ownerId) {
  var groupedData = {
    depos: [],
    mngAccs: [],
    initialized: [],
    userPref: {}
  };
  try {
    var depoMngAccWithInitValue = datastoreSvc.queryDepoMngAccWithInitValue(ownerId);
    var user = datastoreSvc.queryExistingUser(ownerId);
    await Promise.all([depoMngAccWithInitValue, user]).then((resolvedArr) => {

      var depoMngAccWithInitValueArr = resolvedArr[0];
      depoMngAccWithInitValueArr.forEach((entry) => {
        if(entry.type == "depo") {
          groupedData.depos.push(entry);
        }else if(entry.type == "mngAcc") {
          groupedData.mngAccs.push(entry);
        }else if(entry.type == "income") {
          groupedData.initialized.push(entry);
        }
      });

      groupedData.userPref = resolvedArr[1].prefs;

    });
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return groupedData;
}

exports.isValidIssuer = async function(transIssuerId, depoId, mngAccId) {
  var isValid = false;
  try {
    var depoPromise = datastoreSvc.queryDepoById(depoId);
    var mngAccPromise = datastoreSvc.queryMngAccById(mngAccId);
    isValid = await Promise.all([depoPromise, mngAccPromise]).then((resArr) => {
      var depo = resArr[0];
      var mngAcc = resArr[1];
      return depo != null
        && mngAcc != null
        && (depo.ownerId == transIssuerId || depo.editorIds.includes(transIssuerId))
        && (mngAcc.ownerId == transIssuerId || mngAcc.editorIds.includes(transIssuerId))
    });
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return isValid;
}

exports.isInitialized = async function(depoId, mngAccId) {
  var isInitialized = false;
  try {
    var depo = await datastoreSvc.queryDepoById(depoId);
    if(depo != null) {
      var initRecords = await datastoreSvc.queryInitIncomeRecord(depo.ownerId);
      isInitialized = initRecords.filter((initRecord) => {
        return (initRecord.depo == depoId) && (initRecord.mngAcc == mngAccId)
      }).length == 1;
    }
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  console.log("combo of depo: %s and mngAdd: %s is initialized? %s", depoId, mngAccId, isInitialized);
  return isInitialized;
}

exports.saveIncomeRecord = async function(itemName, itemDesc, transAmount, transDateTime, transIssuer, depoId, mngAccId) {
  var operSuccess = false;
  try {
    var depo = await datastoreSvc.queryDepoById(depoId);
    var incomeRecord = incomeRecordFactory.buildIncomeRecord(
      depo.ownerId
      , []
      , []
      , itemName
      , itemDesc
      , transAmount
      , new Date(transDateTime)
      , "income"
      , transIssuer
      , depoId
      , mngAccId
    );
    operSuccess = await datastoreSvc.insertIncomeRecord(incomeRecord);
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return operSuccess;
}




// TODO merge expense and income to the same module

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
