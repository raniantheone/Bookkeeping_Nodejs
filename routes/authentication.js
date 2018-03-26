var express = require("express");
var authenController = require("../controllers/authenticationController");
var router = express.Router();

// check if login credentials are valid
router.post("/login", authenController.login);

// check if current client is authenticated
router.post("/checkAuthen", authenController.checkAuthenStat);

// TODO next phase feature, refresh access token for user who decide to keep logged in for certain period

module.exports = router;
