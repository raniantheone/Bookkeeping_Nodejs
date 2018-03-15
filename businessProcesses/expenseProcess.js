/**
 * This module contains business logic for expense flow.
 * @module expenseProcess
 */

var datastoreSvc = require("../services/datastoreService");
var valUtil = require("../utils/validation");
var expenseRecordFactory = require("./models/expenseRecord");

/**
 * @typedef {Object} Combo
 * @property {string} depoId Unique depository id.
 * @property {string} depoDisplayName Specified by user and can be displayed directly. Not unique.
 * @property {string} mngAccId Unique managing account id.
 * @property {string} mngAccDisplayName Specified by user and can be displayed directly. Not unique.
 */

/**
 * @typedef {Object} UserPref
 * @property {string} arbitraryKV any key-value pair(s) representing user preference detail. For expense related preference, the key range is [preferredExpenseDepo, preferredExpenseMngAcc].
 */

/**
 * @typedef {Object} InitializedDepoMngAccAndUserPref
 * @property {Combo[]} availCombination Initialized combinations of depsoitory - managing account; will be an empty array if no record was found.
 * @property {UserPref} userPref User preference(s) presented as key - value in this object; will be an empty object if no preference exists.
 */

/**
 * Given an existing owner, get his/her initialized depository - managing account combinations
 * , as well as his/her depository or managing account preference if any.
 * <br>\*Expense records can only be issued under initialized combinations.
 * @param {string} ownerId The owner of depository - managing account combinations.
 * @returns {InitializedDepoMngAccAndUserPref} An object which contains available initialized combinations and preference of the user.
 */
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

/**
 * Keep an expense record.
 * @param {string} itemName Name of expense item.
 * @param {string} itemDesc Optional description.
 * @param {number} transAmount How much is spent.
 * @param {string} transDateTime Date string; iso format expected.
 * @param {string} transType "expense"
 * @param {string} transIssuer The person who issued this expense transaction.
 * @param {string} depoId Id of the depository.
 * @param {string} mngAccId Managing account of the depository.
 * @returns {boolean} True if the record is successfully kept.
 */
exports.saveExpenseRecord = async function(itemName, itemDesc, transAmount, transDateTime, transType, transIssuer, depoId, mngAccId) {
  var insertSuccess = false;
  try {

    var matchedDepo = await datastoreSvc.queryDepoById(depoId);
    var ownerId = matchedDepo != null ? matchedDepo.ownerId : "";
    if(ownerId.length == 0) {
      return insertSuccess;
    };

    var expenseRecord = expenseRecordFactory.buildExpenseRecord(
      ownerId
      , []
      , []
      , itemName
      , itemDesc
      , transAmount
      , new Date(transDateTime)
      , transType
      , transIssuer
      , depoId
      , mngAccId
    );
    insertSuccess = await datastoreSvc.insertExpenseRecord(expenseRecord);

  } catch(err) {
    console.log(err + " <-- err happend; process layer - saveExpenseRecord consumes it and returns default value");
  }
  return insertSuccess;
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

/**
 * Check if the depository - managing account is initialized
 * , and if the expense issuer can use the depository and managing account.
 * <br>\*Expense records can only be issued under initialized combinations.
 * @param {string} transIssuer The ownerId of <b>expense issuer</b>.
 * @param {string} depoId The id of depository.
 * @param {string} mngAccId The id of managing account.
 * @returns {boolean} Only true if the depository - managing account is initialized and if the expense issuer can use it.
 */
exports.comboIsInitializedAndAvailable = async function(transIssuer, depoId, mngAccId) {
  var isInitializedAndAvailable = false;
  try {

    var matchedDepo = await datastoreSvc.queryDepoById(depoId);
    var ownerId = matchedDepo != null ? matchedDepo.ownerId : "";
    if(ownerId.length == 0) {
      return isInitializedAndAvailable;
    };

    var entries = await datastoreSvc.queryDepoMngAccWithInitValue(ownerId);
    var isInitialized = false;
    var isAvailableDepo = false;
    var isAvailableMngAcc = false;
    entries.forEach((entry) => {
      if(entry.type == "income" && entry.transType == "init" && entry.depo == depoId && entry.mngAcc == mngAccId) {
        isInitialized = true;
      }else if(entry.ownerId == transIssuer || entry.editorIds.includes(transIssuer)) {
        if(entry.type == "depo" && entry.id == depoId) {
          isAvailableDepo = true;
        }else if(entry.type == "mngAcc" && entry.id == mngAccId) {
          isAvailableMngAcc = true;
        }
      }
    });
    isInitializedAndAvailable = isInitialized && isAvailableDepo && isAvailableMngAcc;
    console.log("isInitialized: %s, isAvailableDepo %s, isAvailableMngAcc: %s", isInitialized, isAvailableDepo, isAvailableMngAcc);

  } catch(err) {
    console.log(err + " <-- err happend; process layer - comboIsInitializedAndAvailable consumes it and returns default value");
  }
  return isInitializedAndAvailable;
}
