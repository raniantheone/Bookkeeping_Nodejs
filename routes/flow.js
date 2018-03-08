var express = require("express");
var expenseController = require("../controllers/expenseController");
var router = express.Router();

// Serve initial page form setup data for "keep expense record" page
router.post("/expense/initData", expenseController.getDynamicInitData);

// Keep expense record
router.post("/expense/keepRecord", expenseController.keepExpenseRecord);

module.exports = router;
