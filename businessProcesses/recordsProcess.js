var cls = require('cls-hooked');
var logUtil = require("../utils/customLogger");
var logger = logUtil.logger;
var datastoreSvc = require("../services/datastoreService");
var config = require("../config/sysConfig");
var vldUtil = require("../utils/validation");


exports.transIssuerExists = async function(transIssuer) {
  var itExists = false;
  try {
    var user = await datastoreSvc.queryExistingUser(transIssuer);
    itExists = (user != null && user.ownerId == transIssuer);
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return itExists;
}

exports.searchMatchedRecords = async function(startTime, endTime, ownerId, transIssuer) {
  var matchedRecords = {
    records: [],
    count: 0
  };
  try {

    if(!vldUtil.isDate(startTime)) {
      startTime = null;
      logger.info("Ignore opotional startTime, because passed-in value is" + startTime);
    };
    if(!vldUtil.isDate(endTime)) {
      endTime = null;
      logger.info("Ignore opotional endTime, because passed-in value is" + endTime);
    };
    if(vldUtil.isEmpty(ownerId)) {
      ownerId = null;
      logger.info("Ignore opotional ownerId, because passed-in value is" + ownerId);
    };
    var rawRecords = await datastoreSvc.queryFlowRecord(startTime, endTime, ownerId, transIssuer);

    var availableDepos = await datastoreSvc.queryAvailableDepos(transIssuer);
    var availableMngAccs = await datastoreSvc.queryAvailableMngAccs(transIssuer);

    matchedRecords.records = rawRecords.map((rawRecord) => {
      let record = rawRecord;
      [record.depoName] = availableDepos.filter((depo) => {
        return depo.id == record.depo;
      }).map((matchedDepo) => {
        return matchedDepo.displayName;
      });
      [record.mngAccName] = availableMngAccs.filter((mngAcc) => {
        return mngAcc.id == record.mngAcc;
      }).map((matchedMngAcc) => {
        return matchedMngAcc.displayName;
      });
      return record;
    }).filter((record) => {
      return vldUtil.isNotEmpty(record.depoName) && vldUtil.isNotEmpty(record.mngAccName); // if the depo or mngAcc is not available to the issuer, he/she cannot access it anymore
    });
    matchedRecords.count = matchedRecords.records.length;

  } catch(err) {
    logger.error(err + " <-- err happend; process searchMatchedRecords consumes it and returns default value");
  }
  return matchedRecords;
};
