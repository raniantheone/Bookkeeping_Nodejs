var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser')
var flowRouter = require("./routes/flow");
var configRouter = require("./routes/config");
var analysisRouter = require("./routes/analysis");
var app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// app.use("/bookkeeping", function(req, res, next) {
//   let cookie = req.cookies.testAuth;
//   console.log("hit authen check, cookie content: " + cookie);
//   if(cookie) {
//     next();
//   }else{
//     res.cookie("testAuth", "checked");
//     next();
//   }
// });

app.use("/bookkeeping", express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => res.send('Hello World!'));

app.use("/flow", flowRouter);

app.use("/config", configRouter);

app.use("/analysis", analysisRouter);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
