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
    initDepoNameA = initDepoA.displayName;
    await datastoreSvc.createDepo(initDepoA);

    var initMngAccA = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc A", [], []);
    initMngAccIdA = initMngAccA.id;
    initMngAccNameA = initMngAccA.displayName;
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
    initDepoNameB = initDepoB.displayName;
    await datastoreSvc.createDepo(initDepoB);

    var initMngAccB = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc B", [], []);
    initMngAccIdB = initMngAccB.id;
    initMngAccNameB = initMngAccB.displayName;
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

    it("Should return initialized depo-mngAcc combinations with displayName, and user preference should be an empty object", async function() {

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

      assert.equal(Object.keys(result.userPref).length, 0, "Tester should not have any preference now.");

    });

    describe("Now user have expense preference for depo A and mngAcc A", function() {
      before(async function() {

        await datastoreSvc.saveUserPrefs("somebody@test.org", [
          {preferredExpenseDepo: initDepoIdA},
          {preferredExpenseMngAcc: initMngAccIdA}
        ]);

      });

      it("Should return user preference content", async function() {

        var result = await expenseProc.getInitDepoMngAccAndPref("somebody@test.org");
        assert.equal(result.userPref.preferredExpenseDepo, initDepoIdA, "Tester's preferred expense depoId should be that of depo A.");
        assert.equal(result.userPref.preferredExpenseMngAcc, initMngAccIdA, "Tester's preferred expense mngAccId should be that of depo A.");
        console.log(result);

      });
    });

  });

  describe("#comboIsInitializedAndAvailable", function() {

    // scenario: depo and mngAcc C is not initialized

    var testDepoIdC;
    var testMngAccIdC;
    var irrelevantUserId;

    before(async function() {
      var testDepoC = depoFactory.buildDepository("somebody@test.org", "test depo C", [], []);
      testDepoIdC = testDepoC.id;
      await datastoreSvc.createDepo(testDepoC);

      var testMngAccC = mngAccFactory.buildManagingAccount("somebody@test.org", "test mngAcc C", [], []);
      testMngAccIdC = testMngAccC.id;
      await datastoreSvc.createMngAcc(testMngAccC);

      var irrelevantUser = userFactory.buildUser("nobody@test.org", "password", "email", "nobody", new Date());
      irrelevantUserId = irrelevantUser.id;
      await datastoreSvc.insertUser(irrelevantUser);
    });

    it("Should not pass check when depo-mngAcc combo is not initialized", async function() {
      var res = await expenseProc.comboIsInitializedAndAvailable("somebody@test.org", testDepoIdC, testMngAccIdC);
      assert.equal(res, false);
    });

    it("Should not pass check when initialized depo-mngAcc is not available to the issuer", async function() {
      var res = await expenseProc.comboIsInitializedAndAvailable("nobody@test.org", initDepoIdA, initMngAccIdA);
      assert.equal(res, false);
    });

    it("Should pass when initialized depo-mngAcc is available to the issuer", async function() {
      var res = await expenseProc.comboIsInitializedAndAvailable("somebody@test.org", initDepoIdA, initMngAccIdA);
      assert.equal(res, true);
    });

    after(async function() {
      let testDocIdsToBeCleared = [
        testDepoIdC
        , testMngAccIdC
        , irrelevantUserId
      ];
      for(let docId of testDocIdsToBeCleared) {
        await datastoreSvc.deleteDocumentById(docId);
      }
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
