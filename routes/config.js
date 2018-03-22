var express = require("express");
var configController = require("../controllers/configController");
var router = express.Router();

// serve available depositories, managing accounts, and user specified initial quantity
router.post("/currentDepoMngAcc", configController.getCurrentDepoMngAccWithInitValue);

// add a new depository
router.post("/addDepo", configController.addDepository);

// modify a currently available depositry
router.post("/editDepo", configController.editDepository);

// delete a currently available depositry
router.post("/deletDepo", configController.deleteDepository);

// add a new managing account
router.post("/addMngAcc", configController.addManagingAccount);

// modify a currently available managing account
router.post("/editMngAcc", configController.editManagingAccount);

// delete a currently available managing account
router.post("/deleteMngAcc", configController.deleteManagingAccount);

// set initial value for a depo-mngAcc
router.post("/initializeDepoMngAcc", configController.initializeDepositoryManagingAccount);

// delete an initialized combo
router.post("/deleteInitializedCombo", configController.deleteInitializedCombo);

module.exports = router;
