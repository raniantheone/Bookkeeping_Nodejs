var cls = require('cls-hooked');
var testReqScope = cls.createNamespace("testReqScope");
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser')
var uuidV4 = require('uuid/v4');
var app = express();
var config = require("./config/sysConfig");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/bookkeeping", express.static(path.join(__dirname, 'public')));

app.use("/", function(req, res, next) {
  var testReqScope = cls.getNamespace("testReqScope");
  testReqScope.bindEmitter(req);
  testReqScope.bindEmitter(res);
  testReqScope.run(function() {
    var reqId = uuidV4().split("-")[0];
    testReqScope.set("reqId", reqId);
    console.log("request id %s set for %s", reqId, req.path);
    next();
  });
});

var flowRouter = require("./routes/flow");
var configRouter = require("./routes/config");
var analysisRouter = require("./routes/analysis");
var recordsRouther = require("./routes/records");
var authenRouter = require("./routes/authentication");
var authenController = require("./controllers/authenticationController");

app.use("/auth", authenRouter); // authentication check and login action will not be blocked by authentication check

// app.use("/", authenController.authenticationGuard); // make sure that request passed to the handlers below is sent by an authenticated client

app.use("/flow", flowRouter);

app.use("/config", configRouter);

app.use("/analysis", analysisRouter);

app.use("/records", recordsRouther);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
