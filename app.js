var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser')
var flowRouter = require("./routes/flow");
var configRouter = require("./routes/config");
var analysisRouter = require("./routes/analysis");
var authenRouter = require("./routes/authentication");
var authenController = require("./controllers/authenticationController");
var app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/bookkeeping", express.static(path.join(__dirname, 'public')));

app.use("/auth", authenRouter);

app.use("/", authenController.authenticationGuard);

app.use("/flow", flowRouter);

app.use("/config", configRouter);

app.use("/analysis", analysisRouter);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
