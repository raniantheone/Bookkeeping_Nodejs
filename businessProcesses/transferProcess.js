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

exports.getInitDepoMngAccWithBalance = getInitDepoMngAccWithBalance;
async function getInitDepoMngAccWithBalance(ownerId) {
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
      return entry.type == "income" && entry.depo.includes(ownerId); // scenario: combo initiated by collaborated cannot be transfer candidate of owner
    });

    // calculate balance of each init entry
    for(let entry of initEntries) {

      var initializedData = {
        depoId: entry.depo,
        mngAccId: entry.mngAcc,
        currentBalance: null
      }

      var expenseTotal = 0;
      var incomeTotal = 0;
      var initValue = 0;
      var balanceParts = await datastoreSvc.queryDepoMngAccBalanceParts(entry.depo, entry.mngAcc, entry.transDateTime);
      balanceParts.forEach((part) => {
        if((part.type == "expense" && part.transType == "expense") || (part.type == "expense" && part.transType == "transfer")) {
          expenseTotal += part.total;
        }else if((part.type == "income" && part.transType == "income") || (part.type == "income" && part.transType == "transfer")) {
          incomeTotal += part.total;
        }else if(part.transType == "init") {
          initValue = part.total;
        }
      });
      initializedData.currentBalance = initValue + incomeTotal - expenseTotal;
      result.initializedDataArr.push(initializedData);
      console.log("init %s + in total %s - exp total %s = %s", initValue, incomeTotal, expenseTotal, initializedData.currentBalance);

    }

  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return result;
}

exports.isValidAmtFromSourceToTargetOfTheOwner = async function(ownerId, sourceDepoId, sourceMngAccId, targetDepoId, targetMngAcc, transAmount) {
  var passedCheck = false;
  try {
    var initDataWithBalance = await getInitDepoMngAccWithBalance(ownerId);
    var availDepoIds = initDataWithBalance.depos.map((entry) => { return entry.id });
    var availMngAccs = initDataWithBalance.mngAccs.map((entry) => { return entry.id });
    var source = initDataWithBalance.initializedDataArr.filter(
      (initEntry) => { return initEntry.depoId == sourceDepoId && initEntry.mngAccId == sourceMngAccId }
    );
    var target = initDataWithBalance.initializedDataArr.filter(
      (initEntry) => { return initEntry.depoId == targetDepoId && initEntry.mngAccId == targetMngAcc }
    );
    passedCheck = availDepoIds.includes(sourceDepoId)
      && availDepoIds.includes(sourceDepoId)
      && availMngAccs.includes(sourceMngAccId)
      && availMngAccs.includes(targetMngAcc)
      && source.length == 1
      && source[0].currentBalance >= transAmount
      && target.length == 1
      && transAmount > 0;
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return passedCheck;
}

exports.transferFromSourceToTarget = async function(ownerId, sourceDepoId, sourceMngAccId, targetDepoId, targetMngAccId, transAmount) {
  var transferSuccess = false;
  var outboundTransferRecord = null;
  var outboundSuccess = false;
  var inboundTransferRecord = null;
  var inboundSuccess = false;
  try {

    var depos = await datastoreSvc.queryAvailableDepos(ownerId);
    var mngAccs = await datastoreSvc.queryAvailableMngAccs(ownerId);

    outboundTransferRecord = expenseRecordFactory.buildExpenseRecord(
      ownerId
      , []
      , []
      , "transfer"
      , "send to " + depos.filter((depo) => { return depo.id == targetDepoId; })[0]["displayName"] + " - " + mngAccs.filter((mngAcc) => { return mngAcc.id == targetMngAccId; })[0]["displayName"]
      , transAmount
      , new Date()
      , "transfer"
      , ownerId
      , sourceDepoId
      , sourceMngAccId
    );
    outboundSuccess = await datastoreSvc.insertExpenseRecord(outboundTransferRecord);

    inboundTransferRecord = incomeRecordFactory.buildIncomeRecord(
      ownerId
      , []
      , []
      , "transfer"
      , "receive from " + depos.filter((depo) => { return depo.id == sourceDepoId; })[0]["displayName"] + " - " + mngAccs.filter((mngAcc) => { return mngAcc.id == sourceMngAccId; })[0]["displayName"]
      , transAmount
      , new Date()
      , "transfer"
      , ownerId
      , targetDepoId
      , targetMngAccId
    );
    inboundSuccess = await datastoreSvc.insertIncomeRecord(inboundTransferRecord);

    transferSuccess = outboundSuccess && inboundSuccess;

  } catch(err) {
    try {
      // delete outbound, inbound record if the whole process failed; tested manually
      if(outboundSuccess) {
        await datastoreSvc.deleteDocumentById(outboundTransferRecord.id);
        console.log("err %s happened, revert transfer outbound record %s", err, outboundTransferRecord.id);
      }
      if(inboundSuccess) {
        await datastoreSvc.deleteDocumentById(inboundTransferRecord.id);
        console.log("err %s happened, revert transfer inbound record %s", err, inboundTransferRecord.id);
      }
      if(!outboundSuccess && !inboundSuccess) {
        console.log("err %s happend, but neither outbound nor inbound record is created", err);
      }
    } catch(err) {
      console.log("cannot complete #transferFromSourceToTarget, and revert process failed as well, could be serious issue, please check the err %", err);
    }
  }
  return transferSuccess;
}
