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

    var depoMngAccInitValArr = await datastoreSvc.queryDepoMngAccWithInitValue(ownerId);
    var initializedEntries = [];
    for(let entry of depoMngAccInitValArr) {
      if(entry.type == "depo") {
        balanceData.depos.push(entry);
      }else if(entry.type == "mngAcc") {
        balanceData.mngAccs.push(entry);
      }else if(entry.type == "income") {
        initializedEntries.push(entry);
      }
    };

    for(let initEntry of initializedEntries) {
      let balanceEntry = {
        depoId: initEntry.depo,
        mngAccId: initEntry.mngAcc,
        expenseSum: 0,
        outboundTransferSum: 0,
        incomeSum: 0,
        inboundTransferSum: 0,
        currentBalance: 0
      }
      var balanceParts = await datastoreSvc.queryDepoMngAccBalanceParts(balanceEntry.depoId, balanceEntry.mngAccId, initEntry.transDateTime);
      var initValue = 0;
      balanceParts.forEach((part) => {
        if(part.type == "expense" && part.transType == "expense") {
          balanceEntry.expenseSum = part.total;
        }else if(part.type == "expense" && part.transType == "transfer") {
          balanceEntry.outboundTransferSum = part.total;
        }else if(part.type == "income" && part.transType == "income") {
          balanceEntry.incomeSum = part.total;
        }else if(part.type == "income" && part.transType == "transfer") {
          balanceEntry.inboundTransferSum = part.total;
        }else if(part.transType == "init") {
          initValue = part.total;
        }
      });
      balanceEntry.currentBalance = initValue
        + balanceEntry.incomeSum
        + balanceEntry.inboundTransferSum
        - balanceEntry.expenseSum
        - balanceEntry.outboundTransferSum;
      balanceData.balanceEntries.push(balanceEntry);
      console.log("init %s + income %s + inbound %s - expense %s - outbound %s = %s",
        initValue
        , balanceEntry.incomeSum
        , balanceEntry.inboundTransferSum
        , balanceEntry.expenseSum
        , balanceEntry.outboundTransferSum
        , balanceEntry.currentBalance
      )
    }

  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return balanceData;
}
