var chai = require('chai');
var assert = chai.assert;

var datastoreSvc = require("../services/datastoreService");
var incomeRecordFactory = require("../businessProcesses/models/incomeRecord");
var expenseRecordFactory = require("../businessProcesses/models/expenseRecord");
var depoFactory = require("../businessProcesses/models/depository");
var mngAccFactory = require("../businessProcesses/models/managingAccount");
var userFactory = require("../businessProcesses/models/user");
var analysisProc = require("../businessProcesses/analysisProcess");
var transferProc = require("../businessProcesses/transferProcess");

describe("#analysisProc", function() {

  var testUserId;
  var testDepoId_A;
  var testMngAccId_A;
  var testInitRecordId_A;
  var testExpenseRecordId_A;
  var testIncomeRecordId_A;
  var testDepoId_B;
  var testMngAccId_B;
  var testInitRecordId_B;
  var testExpenseRecordId_B;
  var testIncomeRecordId_B;
  var testOutboundTransRecordId;
  var testInboundTransRecordId;

  before(async function() {

    var user = userFactory.buildUser("somebody@test.org", "password", "email", "somebody", new Date());
    testUserId = user.id;
    await datastoreSvc.insertUser(user);

    var depo = depoFactory.buildDepository("somebody@test.org", "test depo", [], []);
    testDepoId_A = depo.id;
    await datastoreSvc.createDepo(depo);

    var mngAcc = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc", [], []);
    testMngAccId_A = mngAcc.id;
    await datastoreSvc.createMngAcc(mngAcc);

    var initRecord = incomeRecordFactory.buildIncomeRecord(
      "somebody@test.org",
      [],
      [],
      "init",
      "",
      100,
      new Date(),
      "init", // transType constant for init record
      "somebody@test.org",
      testDepoId_A,
      testMngAccId_A
    );
    testInitRecordId_A = initRecord.id;
    await datastoreSvc.insertIncomeRecord(initRecord);

    var expenseRecord = expenseRecordFactory.buildExpenseRecord(
      "somebody@test.org",
      [],
      [],
      "test",
      "via mocha",
      50,
      new Date(),
      "expense",
      "somebody@test.org",
      testDepoId_A,
      testMngAccId_A
    );
    testExpenseRecordId_A = expenseRecord.id;
    await datastoreSvc.insertExpenseRecord(expenseRecord);

    var incomeRecord = incomeRecordFactory.buildIncomeRecord(
      "somebody@test.org"
      , []
      , []
      , "test"
      , "via mocha"
      , 5
      , new Date()
      , "income"
      , "somebody@test.org"
      , testDepoId_A
      , testMngAccId_A
    );
    testIncomeRecordId_A = incomeRecord.id;
    await datastoreSvc.insertIncomeRecord(incomeRecord);



    var depoB = depoFactory.buildDepository("somebody@test.org", "test depo B", [], []);
    testDepoId_B = depoB.id;
    await datastoreSvc.createDepo(depoB);

    var mngAccB = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc B", [], []);
    testMngAccId_B = mngAccB.id;
    await datastoreSvc.createMngAcc(mngAccB);

    var initRecordB = incomeRecordFactory.buildIncomeRecord(
      "somebody@test.org",
      [],
      [],
      "init",
      "",
      500,
      new Date(),
      "init", // transType constant for init record
      "somebody@test.org",
      testDepoId_B,
      testMngAccId_B
    );
    testInitRecordId_B = initRecordB.id;
    await datastoreSvc.insertIncomeRecord(initRecordB);

    var expenseRecordB = expenseRecordFactory.buildExpenseRecord(
      "somebody@test.org",
      [],
      [],
      "test B",
      "via mocha",
      1,
      new Date(),
      "expense",
      "somebody@test.org",
      testDepoId_B,
      testMngAccId_B
    );
    testExpenseRecordId_B = expenseRecordB.id;
    await datastoreSvc.insertExpenseRecord(expenseRecordB);

    var incomeRecordB = incomeRecordFactory.buildIncomeRecord(
      "somebody@test.org"
      , []
      , []
      , "test B"
      , "via mocha"
      , 10
      , new Date()
      , "income"
      , "somebody@test.org"
      , testDepoId_B
      , testMngAccId_B
    );
    testIncomeRecordId_B = incomeRecordB.id;
    await datastoreSvc.insertIncomeRecord(incomeRecordB);

  });

  describe("#ownerIdExists", function() {
    it("Finding an existing user", async function() {
      var res = await analysisProc.ownerIdExists("somebody@test.org");
      assert.equal(res, true, "should return true")
    });
    it("Finding an not existing user", async function() {
      var res = await analysisProc.ownerIdExists("nobody@gmail.com");
      assert.equal(res, false, "should return false")
    });
  });

  describe("#getBalanceOfDepoMngAcc", function() {

    before(async function() {
      await transferProc.transferFromSourceToTarget("somebody@test.org", testDepoId_B, testMngAccId_B, testDepoId_A, testMngAccId_A, 100);
    });

    it("Finding mapping data for depo and mngAcc, and balance entries by each depo-mngAcc", async function() {

      var res = await analysisProc.getBalanceOfDepoMngAcc("somebody@test.org");

      assert.isAbove(res.depos.length, 0, "mapping data should contain depos");
      assert.isAbove(res.mngAccs.length, 0, "mapping data should contain mngAccs");
      assert.isAbove(res.balanceEntries.length, 0, "there should be balance data");

      var balanceEntryA = res.balanceEntries.filter((entry) => {
        return entry.depoId == testDepoId_A && entry.mngAccId == testMngAccId_A;
      }).reduce((match) => {
        return match;
      });
      assert.equal(balanceEntryA.expenseSum, 50, "expense sum of balance A should match setup data");
      assert.equal(balanceEntryA.outboundTransferSum, 0, "balance A should not have outbound transfer data");
      assert.equal(balanceEntryA.incomeSum, 5, "income sum of balance A should match setup data");
      assert.equal(balanceEntryA.inboundTransferSum, 100, "balance A should have inbound transfer data of 100");
      assert.equal(balanceEntryA.currentBalance, 155, "current balance A should be 155");

      var balanceEntryB = res.balanceEntries.filter((entry) => {
        return entry.depoId == testDepoId_B && entry.mngAccId == testMngAccId_B;
      }).reduce((match) => {
        return match;
      });
      assert.equal(balanceEntryB.expenseSum, 1, "expense sum of balance B should match setup data");
      assert.equal(balanceEntryB.outboundTransferSum, 100, "balance B should have outbound transfer data of 100");
      assert.equal(balanceEntryA.incomeSum, 10, "income sum of balance 10 should match setup data");
      assert.equal(balanceEntryA.inboundTransferSum, 0, "balance A should not have inbound transfer data");
      assert.equal(balanceEntryA.currentBalance, 409, "current balance A should be 409");
    });

    after(async function() {
      var transferRecords = await datastoreSvc.queryTransferRecords("somebody@test.org");
      for(let record of transferRecords) {
        await datastoreSvc.deleteDocumentById(record.id);
      }
    });

  });

  after(async function() {
    var testDataToBeCleared = [
      testUserId
      , testDepoId_A
      , testMngAccId_A
      , testInitRecordId_A
      , testExpenseRecordId_A
      , testIncomeRecordId_A
      , testDepoId_B
      , testMngAccId_B
      , testInitRecordId_B
      , testExpenseRecordId_B
      , testIncomeRecordId_B
    ];
    for(let docId of testDataToBeCleared) {
      await datastoreSvc.deleteDocumentById(docId);
    }
  });

});
