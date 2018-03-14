var chai = require('chai');
var assert = chai.assert;

var datastoreSvc = require("../services/datastoreService");
var incomeRecordFactory = require("../businessProcesses/models/incomeRecord");
var depoFactory = require("../businessProcesses/models/depository");
var mngAccFactory = require("../businessProcesses/models/managingAccount");
var userFactory = require("../businessProcesses/models/user");
var expenseProc = require("../businessProcesses/expenseProcess.js");


describe("Test expenseProcess", function() {

  var testUserId;
  var initDepoIdA;
  var initDepoNameA;
  var initMngAccIdA;
  var initMngAccNameA;
  var initIncomeRecordIdA;
  var initDepoIdB;
  var initDepoNameB;
  var initMngAccIdB;
  var initMngAccNameB;
  var initIncomeRecordIdB;

  before(async function() {

    var user = userFactory.buildUser("somebody@test.org", "password", "email", "somebody", new Date());
    testUserId = user.id;
    await datastoreSvc.insertUser(user);

    var initDepoA = depoFactory.buildDepository("somebody@test.org", "test depo A", [], []);
    initDepoIdA = initDepoA.id;
    await datastoreSvc.createDepo(initDepoA);

    var initMngAccA = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc A", [], []);
    initMngAccIdA = initMngAccA.id;
    await datastoreSvc.createMngAcc(initMngAccA);

    var initIncomeRecordA = incomeRecordFactory.buildIncomeRecord(
      "somebody@test.org",
      [],
      [],
      "init",
      "init combo A",
      100,
      new Date(),
      "init", // transType constant for init record
      "somebody@test.org",
      initDepoIdA,
      initMngAccIdA
    );
    initIncomeRecordIdA = initIncomeRecordA.id;
    await datastoreSvc.insertIncomeRecord(initIncomeRecordA);

    var initDepoB = depoFactory.buildDepository("somebody@test.org", "test depo B", [], []);
    initDepoIdB = initDepoB.id;
    await datastoreSvc.createDepo(initDepoB);

    var initMngAccB = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc B", [], []);
    initMngAccIdB = initMngAccB.id;
    await datastoreSvc.createMngAcc(initMngAccB);

    var initIncomeRecordB = incomeRecordFactory.buildIncomeRecord(
      "somebody@test.org",
      [],
      [],
      "init",
      "init combo B",
      200,
      new Date(),
      "init", // transType constant for init record
      "somebody@test.org",
      initDepoIdB,
      initMngAccIdB
    );
    initIncomeRecordIdB = initIncomeRecordB.id;
    await datastoreSvc.insertIncomeRecord(initIncomeRecordB);

  });

  describe("#getInitDepoMngAccAndPref", function() {

    it("Should return initialized depo-mngAcc combinations with displayName, as well as user preference", async function() {

      var result = await expenseProc.getInitDepoMngAccAndPref("somebody@test.org");
      assert.equal(result.availCombination.length, 2, "There should be 2 initialized entries.");

      var matchedArrA = result.availCombination.filter((combo) => {
        return combo.depoId == initDepoIdA && combo.mngAccId == initMngAccIdA;
      });
      assert.equal(matchedArrA.length, 1, "There should be 1 initialized entry for test combo A.");

      var testCombinationA = matchedArrA[0];
      assert.equal(testCombinationA.depoDisplayName, initDepoNameA, "Depo display name of test combo A should match test data");
      assert.equal(testCombinationA.mngAccDisplayName, initMngAccNameA, "MngAcc display name of test combo A should match test data");

      var matchedArrB = result.availCombination.filter((combo) => {
        return combo.depoId == initDepoIdB && combo.mngAccId == initMngAccIdB;
      });
      assert.equal(matchedArrB.length, 1, "There should be 1 initialized entry for test combo B.");

      var testCombinationB = matchedArrB[0];
      assert.equal(testCombinationB.depoDisplayName, initDepoNameB, "Depo display name of test combo B should match test data");
      assert.equal(testCombinationB.mngAccDisplayName, initMngAccNameB, "MngAcc display name of test combo B should match test data");

      assert.equal(result.userPref.preferredExpenseDepo, initDepoIdA, "Tester's preferred expense depoId should be that of depo B.");
      assert.equal(result.userPref.preferredExpenseMngAcc, initMngAccIdA, "Tester's preferred expense mngAccId should be that of depo B.");

    });

  });

  after(async function() {

    var testDocIdsToBeCleared = [
      testUserId
      , initDepoIdA
      , initMngAccIdA
      , initIncomeRecordIdA
      , initDepoIdB
      , initMngAccIdB
      , initIncomeRecordIdB
    ];
    for(let docId of testDocIdsToBeCleared) {
      await datastoreSvc.deleteDocumentById(docId);
    }

  });

});
