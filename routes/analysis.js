var express = require("express");
var analysisController = require("../controllers/analysisController");
var router = express.Router();

// Serve balance distribution data
router.post("/balanceDistribution", analysisController.getBalanceDistribution);

module.exports = router;
