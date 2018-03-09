var datastoreSvc = require("../services/datastoreService");
var incomeRecordFactory = require("../businessProcesses/models/incomeRecord");
var expenseRecordFactory = require("./models/expenseRecord");

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

exports.getInitDepoMngAccWithBalance = async function(ownerId) {
  console.log("getInitDepoMngAccWithBalance invoked with %s", ownerId);
  var result = {
    depos: [],
    mngAccs: [],
    initializedDataArr: []
  };
  try {

    // get init entries as well as mapping data for depoId and mngAccId
    var depoMngAccInitValArr = await datastoreSvc.queryDepoMngAccWithInitValue(ownerId);
    var initEntries = depoMngAccInitValArr.filter((entry) => {
      if(entry.type == "depo") {
        result.depos.push(entry);
      }else if(entry.type == "mngAcc") {
        result.mngAccs.push(entry);
      }
      return entry.type == "income";
    });

    // calculate balance of each init entry
    for(let entry of initEntries) {

      var initializedData = {
        depoId: entry.depo,
        mngAccId: entry.mngAcc,
        currentBalance: null
      }

      var expenseTotal = null;
      var incomeTotal = null;
      var initValue = null;
      var balanceParts = await datastoreSvc.queryDepoMngAccBalanceParts(entry.depo, entry.mngAcc, entry.transDateTime);
      balanceParts.forEach((part) => {
        if(part.transType == "expense") {
          expenseTotal = part.total;
        }else if(part.transType == "income") {
          incomeTotal = part.total;
        }else if(part.transType == "init") {
          initValue = part.total;
        }
      });
      initializedData.currentBalance = initValue + incomeTotal - expenseTotal;
      result.initializedDataArr.push(initializedData);

    }

  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return result;
}
