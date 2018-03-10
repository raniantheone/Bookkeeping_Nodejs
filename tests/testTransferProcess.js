var chai = require('chai');
var assert = chai.assert;

var datastoreSvc = require("../services/datastoreService");
var transferProc = require("../businessProcesses/transferProcess");
var incomeRecordFactory = require("../businessProcesses/models/incomeRecord");
var expenseRecordFactory = require("../businessProcesses/models/expenseRecord");
var depoFactory = require("../businessProcesses/models/depository");
var mngAccFactory = require("../businessProcesses/models/managingAccount");
var userFactory = require("../businessProcesses/models/user");

describe("#transferProcess", function() {

  var testUserId;
  var testDepoId;
  var testMngAccId;
  var testInitRecordId;
  var testExpenseRecordId;
  var testIncomeRecordId;

  before(async function() {

    var user = userFactory.buildUser("somebody@test.org", "password", "email", "somebody", new Date());
    testUserId = user.id;
    await datastoreSvc.insertUser(user);

    var depo = depoFactory.buildDepository("somebody@test.org", "test depo", [], []);
    testDepoId = depo.id;
    await datastoreSvc.createDepo(depo);

    var mngAcc = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc", [], []);
    testMngAccId = mngAcc.id;
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
      testDepoId,
      testMngAccId
    );
    testInitRecordId = initRecord.id;
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
      testDepoId,
      testMngAccId
    );
    testExpenseRecordId = expenseRecord.id;
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
      , testDepoId
      , testMngAccId
    );
    testIncomeRecordId = incomeRecord.id;
    await datastoreSvc.insertIncomeRecord(incomeRecord);

  });

  describe("#ownerIdExists", function() {
    it("Finding an existing user, should return true", async function() {
      var res = await transferProc.ownerIdExists("somebody@test.org");
      assert.equal(res, true)
    });
    it("Finding an not existing user, should return false", async function() {
      var res = await transferProc.ownerIdExists("nobody@gmail.com");
      assert.equal(res, false)
    });
  });

  describe("#getInitDepoMngAccWithBalance", function() {

    it("Should get an array for depo and another array for mngAcc", async function() {

      var res = await transferProc.getInitDepoMngAccWithBalance("trista167@gmail.com");
      assert.property(res, "depos", "result does not have property of \"depos\"");
      assert.property(res, "mngAccs", "result does not have property of \"mngAccs\"");
      assert.isTrue(
        res.depos.map((depo) => {
          return depo.type != undefined && depo.type == "depo";
        }).reduce((prevConditional, eachConditional) => {
          return prevConditional && eachConditional;
        }, true),
        "one or more objects in \"depos\" are not of \"depo\" type");
      assert.isTrue(
        res.mngAccs.map((mngAcc) => {
          return mngAcc.type != undefined && mngAcc.type == "mngAcc";
        }).reduce((prevConditional, eachConditional) => {
          return prevConditional && eachConditional;
        }, true),
        "one or more objects in \"mngAcc\" are not of \"depo\" type");

    });

    it("Should get balance of 55 under test depo and mngAcc", async function() {
      var res = await transferProc.getInitDepoMngAccWithBalance("somebody@test.org");
      assert.equal(res.initializedDataArr[0].currentBalance, 55, "calculated balance is not 55");
      assert.equal(res.initializedDataArr[0].depoId, testDepoId, "depoId does not match test data");
      assert.equal(res.initializedDataArr[0].mngAccId, testMngAccId, "mngAccId does not match test data");
    });

  });

  after(async function() {

    await datastoreSvc.deleteDocumentById(testUserId);
    await datastoreSvc.deleteDocumentById(testDepoId);
    await datastoreSvc.deleteDocumentById(testMngAccId);
    await datastoreSvc.deleteDocumentById(testInitRecordId);
    await datastoreSvc.deleteDocumentById(testExpenseRecordId);
    await datastoreSvc.deleteDocumentById(testIncomeRecordId);

  });

});
