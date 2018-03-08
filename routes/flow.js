var express = require("express");
var expenseController = require("../controllers/expenseController");
var incomeController = require("../controllers/incomeController");
var router = express.Router();

// Serve initial page form setup data for "keep expense record" page
router.post("/expense/initData", expenseController.getDynamicInitData);

// Keep expense record
router.post("/expense/keepRecord", expenseController.keepExpenseRecord);

// Serve initialized depo-mngAcc combo, user preferance, and mapping for depo and mngAcc
router.post("/income/getAvailDepoMngAccAndPref", incomeController.getInitDepoMngAccAndPref);

// Keep income record
router.post("/income/keepRecord", incomeController.keepIncomeRecord);

module.exports = router;
