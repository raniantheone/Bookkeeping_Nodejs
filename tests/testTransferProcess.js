// var chai = require('chai');
// var assert = chai.assert;
//
// var datastoreSvc = require("../services/datastoreService");
// var transferProc = require("../businessProcesses/transferProcess");
// var incomeRecordFactory = require("../businessProcesses/models/incomeRecord");
// var expenseRecordFactory = require("../businessProcesses/models/expenseRecord");
// var depoFactory = require("../businessProcesses/models/depository");
// var mngAccFactory = require("../businessProcesses/models/managingAccount");
// var userFactory = require("../businessProcesses/models/user");
//
// describe("#transferProcess", function() {
//
//   var testUserId;
//   var testDepoId_A;
//   var testMngAccId_A;
//   var testInitRecordId_A;
//   var testExpenseRecordId_A;
//   var testIncomeRecordId_A;
//   var testDepoId_B;
//   var testMngAccId_B;
//   var testInitRecordId_B;
//   var testExpenseRecordId_B;
//   var testIncomeRecordId_B;
//
//   before(async function() {
//
//     var user = userFactory.buildUser("somebody@test.org", "password", "email", "somebody", new Date());
//     testUserId = user.id;
//     await datastoreSvc.insertUser(user);
//
//     var depo = depoFactory.buildDepository("somebody@test.org", "test depo", [], []);
//     testDepoId_A = depo.id;
//     await datastoreSvc.createDepo(depo);
//
//     var mngAcc = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc", [], []);
//     testMngAccId_A = mngAcc.id;
//     await datastoreSvc.createMngAcc(mngAcc);
//
//     var initRecord = incomeRecordFactory.buildIncomeRecord(
//       "somebody@test.org",
//       [],
//       [],
//       "init",
//       "",
//       100,
//       new Date(),
//       "init", // transType constant for init record
//       "somebody@test.org",
//       testDepoId_A,
//       testMngAccId_A
//     );
//     testInitRecordId_A = initRecord.id;
//     await datastoreSvc.insertIncomeRecord(initRecord);
//
//     var expenseRecord = expenseRecordFactory.buildExpenseRecord(
//       "somebody@test.org",
//       [],
//       [],
//       "test",
//       "via mocha",
//       50,
//       new Date(),
//       "expense",
//       "somebody@test.org",
//       testDepoId_A,
//       testMngAccId_A
//     );
//     testExpenseRecordId_A = expenseRecord.id;
//     await datastoreSvc.insertExpenseRecord(expenseRecord);
//
//     var incomeRecord = incomeRecordFactory.buildIncomeRecord(
//       "somebody@test.org"
//       , []
//       , []
//       , "test"
//       , "via mocha"
//       , 5
//       , new Date()
//       , "income"
//       , "somebody@test.org"
//       , testDepoId_A
//       , testMngAccId_A
//     );
//     testIncomeRecordId_A = incomeRecord.id;
//     await datastoreSvc.insertIncomeRecord(incomeRecord);
//
//
//
//     var depoB = depoFactory.buildDepository("somebody@test.org", "test depo B", [], []);
//     testDepoId_B = depoB.id;
//     await datastoreSvc.createDepo(depoB);
//
//     var mngAccB = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc B", [], []);
//     testMngAccId_B = mngAccB.id;
//     await datastoreSvc.createMngAcc(mngAccB);
//
//     var initRecordB = incomeRecordFactory.buildIncomeRecord(
//       "somebody@test.org",
//       [],
//       [],
//       "init",
//       "",
//       500,
//       new Date(),
//       "init", // transType constant for init record
//       "somebody@test.org",
//       testDepoId_B,
//       testMngAccId_B
//     );
//     testInitRecordId_B = initRecordB.id;
//     await datastoreSvc.insertIncomeRecord(initRecordB);
//
//     var expenseRecordB = expenseRecordFactory.buildExpenseRecord(
//       "somebody@test.org",
//       [],
//       [],
//       "test B",
//       "via mocha",
//       1,
//       new Date(),
//       "expense",
//       "somebody@test.org",
//       testDepoId_B,
//       testMngAccId_B
//     );
//     testExpenseRecordId_B = expenseRecordB.id;
//     await datastoreSvc.insertExpenseRecord(expenseRecordB);
//
//     var incomeRecordB = incomeRecordFactory.buildIncomeRecord(
//       "somebody@test.org"
//       , []
//       , []
//       , "test B"
//       , "via mocha"
//       , 10
//       , new Date()
//       , "income"
//       , "somebody@test.org"
//       , testDepoId_B
//       , testMngAccId_B
//     );
//     testIncomeRecordId_B = incomeRecordB.id;
//     await datastoreSvc.insertIncomeRecord(incomeRecordB);
//
//   });
//
//   describe("#ownerIdExists", function() {
//     it("Finding an existing user, should return true", async function() {
//       var res = await transferProc.ownerIdExists("somebody@test.org");
//       assert.equal(res, true)
//     });
//     it("Finding an not existing user, should return false", async function() {
//       var res = await transferProc.ownerIdExists("nobody@gmail.com");
//       assert.equal(res, false)
//     });
//   });
//
//   describe("#getInitDepoMngAccWithBalance", function() {
//
//     it("Should get an array for depo and another array for mngAcc", async function() {
//
//       var res = await transferProc.getInitDepoMngAccWithBalance("trista167@gmail.com");
//       assert.property(res, "depos", "result does not have property of \"depos\"");
//       assert.property(res, "mngAccs", "result does not have property of \"mngAccs\"");
//       assert.isTrue(
//         res.depos.map((depo) => {
//           return depo.type != undefined && depo.type == "depo";
//         }).reduce((prevConditional, eachConditional) => {
//           return prevConditional && eachConditional;
//         }, true),
//         "one or more objects in \"depos\" are not of \"depo\" type");
//       assert.isTrue(
//         res.mngAccs.map((mngAcc) => {
//           return mngAcc.type != undefined && mngAcc.type == "mngAcc";
//         }).reduce((prevConditional, eachConditional) => {
//           return prevConditional && eachConditional;
//         }, true),
//         "one or more objects in \"mngAcc\" are not of \"depo\" type");
//
//     });
//
//     it("Should get balance of 55 under depoA and mngAccA, and balance of 509 under depoB and mngAccB", async function() {
//
//       var res = await transferProc.getInitDepoMngAccWithBalance("somebody@test.org");
//
//       var balanceDataA = res.initializedDataArr.filter((initializedData) => {
//         return initializedData.depoId == testDepoId_A && initializedData.mngAccId == testMngAccId_A;
//       });
//       assert.equal(balanceDataA.length, 1, "balance data of depoA and mngAccA is not found, or got more than one record")
//       assert.equal(balanceDataA[0].currentBalance, 55, "calculated balance is not 55");
//
//       var balanceDataB = res.initializedDataArr.filter((initializedData) => {
//         return initializedData.depoId == testDepoId_B && initializedData.mngAccId == testMngAccId_B;
//       });
//       assert.equal(balanceDataB.length, 1, "balance data of depoB and mngAccB is not found, or got more than one record")
//       assert.equal(balanceDataB[0].currentBalance, 509, "calculated balance is not 509");
//
//     });
//
//   });
//
//   describe("#isValidAmtFromSourceToTargetOfTheOwner", function() {
//
//     // scenario: transfer money from testB to testA
//
//     it("Should be invalid with not existing owner", async function() {
//       var res = await transferProc.isValidAmtFromSourceToTargetOfTheOwner("abcdefg", testDepoId_B, testMngAccId_B, testDepoId_A, testMngAccId_A, 100);
//       assert.equal(res, false, "wrong ownerId get passed check");
//     });
//
//     it("Should be invalid with not existing source", async function() {
//       var res = await transferProc.isValidAmtFromSourceToTargetOfTheOwner("somebody@test.org", "testDepoId_B", "testMngAccId_B", testDepoId_A, testMngAccId_A, 100);
//       assert.equal(res, false, "wrong sourceDepo and sourceMngAcc get passed check");
//     });
//
//     it("Should be invalid with not existing target", async function() {
//       var res = await transferProc.isValidAmtFromSourceToTargetOfTheOwner("somebody@test.org", testDepoId_B, testMngAccId_B, "testDepoId_A", "testMngAccId_A", 100);
//       assert.equal(res, false, "wrong targetDepo and targetMngAcc get passed check");
//     });
//
//     it("Should be invalid when transfer amount is greater than source balance", async function() {
//       var res = await transferProc.isValidAmtFromSourceToTargetOfTheOwner("somebody@test.org", testDepoId_B, testMngAccId_B, testDepoId_A, testMngAccId_A, 99999);
//       assert.equal(res, false, "transfer amount greater than source balance get passed check");
//     });
//
//     it("Should be valid with correct user, source, target, and acceptable transfer amount", async function() {
//       var res = await transferProc.isValidAmtFromSourceToTargetOfTheOwner("somebody@test.org", testDepoId_B, testMngAccId_B, testDepoId_A, testMngAccId_A, 100);
//       assert.equal(res, true, "all input is valid but did not pass check");
//     });
//
//   });
//
//   describe("#transferFromSourceToTarget", function() {
//
//     // scenario: transfer money from testB to testA
//
//     it("Source balance should be 409 after transfer, and target balance should be 155", async function() {
//
//       var transSuccess = await transferProc.transferFromSourceToTarget("somebody@test.org", testDepoId_B, testMngAccId_B, testDepoId_A, testMngAccId_A, 100);
//       assert.equal(transSuccess, true, "transfer failed with correct input");
//
//       var depoMngAccAndBalanceData = await transferProc.getInitDepoMngAccWithBalance("somebody@test.org");
//       var sourceBalanceData = depoMngAccAndBalanceData.initializedDataArr.filter((initializedData) => {
//         return initializedData.depoId == testDepoId_B && initializedData.mngAccId == testMngAccId_B;
//       }).reduce((source) => {
//         return source;
//       });
//       var targetBalanceData = depoMngAccAndBalanceData.initializedDataArr.filter((initializedData) => {
//         return initializedData.depoId == testDepoId_A && initializedData.mngAccId == testMngAccId_A;
//       }).reduce((target) => {
//         return target;
//       });
//       assert.equal(409, sourceBalanceData.currentBalance, "source balance is not 409 after transfer");
//       assert.equal(155, targetBalanceData.currentBalance, "target balance is not 155 after transfer");
//
//     });
//
//     after(async function() {
//       var transferRecords = await datastoreSvc.queryTransferRecords("somebody@test.org");
//       for(let record of transferRecords) {
//         await datastoreSvc.deleteDocumentById(record.id);
//       }
//     });
//
//   });
//
//   after(async function() {
//
//     await datastoreSvc.deleteDocumentById(testUserId);
//     await datastoreSvc.deleteDocumentById(testDepoId_A);
//     await datastoreSvc.deleteDocumentById(testMngAccId_A);
//     await datastoreSvc.deleteDocumentById(testInitRecordId_A);
//     await datastoreSvc.deleteDocumentById(testExpenseRecordId_A);
//     await datastoreSvc.deleteDocumentById(testIncomeRecordId_A);
//     await datastoreSvc.deleteDocumentById(testDepoId_B);
//     await datastoreSvc.deleteDocumentById(testMngAccId_B);
//     await datastoreSvc.deleteDocumentById(testInitRecordId_B);
//     await datastoreSvc.deleteDocumentById(testExpenseRecordId_B);
//     await datastoreSvc.deleteDocumentById(testIncomeRecordId_B);
//
//   });
//
// });

/**
Manually test the error handling behavior of transferFromSourceToTarget()
Throw error at certain point and verify log
**/
// var transferProc = require("../businessProcesses/transferProcess");
// var p = transferProc.transferFromSourceToTarget("trista167@gmail.com", "trista167@gmail.com::depo::1184541832", "trista167@gmail.com::mngAcc::3112233494", "trista167@gmail.com::depo::633596129", "trista167@gmail.com::mngAcc::3112233494", 1000);
//
// p.then((res) => {
//   console.log(res);
// }).catch((err) => {
//   console.log(err);
// })
