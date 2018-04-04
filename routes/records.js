var express = require("express");
var recordsController = require("../controllers/recordsController");
var router = express.Router();

// Serve initialized depo-mngAcc combinations and user preference of them
router.post("/checkRecords", recordsController.checkRecords);

module.exports = router;
