var express = require("express");
var expenseController = require("../controllers/expenseController");
var incomeController = require("../controllers/incomeController");
var transferController = require("../controllers/transferController");
var router = express.Router();

// Serve initialized depo-mngAcc combinations and user preference of them
router.post("/expense/initData", expenseController.getAvailDepoMngAccOptForExpense);

// Keep expense record
router.post("/expense/keepRecord", expenseController.keepExpenseRecord);

// Serve initialized depo-mngAcc combo, user preferance, and mapping for depo and mngAcc
router.post("/income/getAvailDepoMngAccAndPref", incomeController.getInitDepoMngAccAndPref);

// Keep income record
router.post("/income/keepRecord", incomeController.keepIncomeRecord);

// Serve transferable depo-mngAcc and its current balance
router.post("/transfer/getTransferableDepoMngAcc", transferController.getTransferableDepoMngAcc);

// Transfer money from source depo-mngAcc to target depo-mngAcc
router.post("/transfer/transferAmount", transferController.transferAmount);

module.exports = router;
