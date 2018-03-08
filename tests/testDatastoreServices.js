var incomeRecordFactory = require("../businessProcesses/models/incomeRecord");
var depoFactory = require("../businessProcesses/models/depository");
var mngAccFactory = require("../businessProcesses/models/managingAccount");
var datastoreSvc = require("../services/datastoreService");

// var p = datastoreSvc.queryDepoMngAccAndPreselect("trista167@gmail.com");

// var p = datastoreSvc.saveUserPrefs("raniantheone@gmail.com", [{greeting: "whatzup"}, {food: "bbq"}]);

// var p = datastoreSvc.queryExpenseTransTypes();

// var p = datastoreSvc.queryAvailableDepos("trista167@gmail.com");

// var p = datastoreSvc.queryAvailableMngAccs("trista167@gmail.com");

// var p = datastoreSvc.queryExistingUser("trista167@gmail.com");

// var p = datastoreSvc.queryDepoMngAccWithInitValue("trista167@gmail.com");

// var incomeRecord = incomeRecordFactory.buildIncomeRecord(
//   "trista167@gmail.com",
//   [],
//   [],
//   "test init",
//   "test init",
//   100,
//   new Date(),
//   "init",
//   "trista167@gmail.com",
//   "trista167@gmail.com::depo::xxx",
//   "trista167@gmail.com::mngAcc::xxx"
// );
// var p = datastoreSvc.insertIncomeRecord(incomeRecord);

// var p = datastoreSvc.queryDepoById("trista167@gmail.com::depo::xxx");

// var depo = depoFactory.buildDepository("trista167@gmail.com", "test depo by Ranian", [], []);
// var p = datastoreSvc.createDepo(depo);

// var p = datastoreSvc.updateDepoName("trista167@gmail.com", "trista167@gmail.com::depo::1184541832", "Joint Envelop");

// var p = datastoreSvc.delDepo("trista167@gmail.com", "trista167@gmail.com::depo::2764530839");

// var mngAcc = mngAccFactory.buildManagingAccount("trista167@gmail.com", "test by Ranian 2", [], []);
// var p = datastoreSvc.createMngAcc(mngAcc);

// var p = datastoreSvc.queryMngAccById("trista167@gmail.com::mngAcc::1782672947");

// var p = datastoreSvc.updateMngAccName("trista167@gmail.com", "trista167@gmail.com::mngAcc::1782672947", "test by Ranian 6");

// var p = datastoreSvc.delMngAcc("trista167@gmail.com", "trista167@gmail.com::mngAcc::570218955");

// var incomeRecord = incomeRecordFactory.buildIncomeRecord(
//   "trista167@gmail.com",
//   [],
//   [],
//   "init",
//   "",
//   500,
//   new Date(),
//   "init",
//   "trista167@gmail.com",
//   "trista167@gmail.com::depo::633596129",
//   "trista167@gmail.com::mngAcc::535076123"
// );
// var p = datastoreSvc.insertIncomeRecord(incomeRecord);

// var p = datastoreSvc.deleteInitRecord("trista167@gmail.com", "trista167@gmail.com::depo::633596129", "trista167@gmail.com::mngAcc::535076123");

// var p = datastoreSvc.querySystemConfig();

// var p = datastoreSvc.queryInitIncomeRecord("trista167@gmail.com");

p.then((dbData) => {
  console.log("oper success");
  console.log(dbData);
}).catch((err) => {
  console.log(err);
});
