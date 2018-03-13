var datastoreSvc = require("../services/datastoreService");
var incomeRecordFactory = require("../businessProcesses/models/incomeRecord");
var expenseRecordFactory = require("./models/expenseRecord");
var depoFactory = require("./models/depository");
var mngAccFactory = require("./models/managingAccount");

exports.ownerIdExists = async function(ownerId) {
  var itExists = false;
  try {
    var user = await datastoreSvc.queryExistingUser(ownerId);
    itExists = (user != null && user.ownerId == ownerId);
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return itExists;
}

exports.getBalanceOfDepoMngAcc = async function(ownerId) {
  var balanceData = {
    depos: [],
    mngAccs: [],
    balanceEntries: []
  };
  // balance Entry
  // {
  //   depoId: string
  //   mngAccId: string
  //   expenseSum:
  //   outboundTransferSum:
  //   incomeSum:
  //   inboundTransferSum:
  //   currentBalance:
  // }
  try {

  } catch(err) {

  }
  return balanceData;
}
