var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var flowRouter = require("./routes/flow");
var configRouter = require("./routes/config");
var app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.send('Hello World!'));

app.use("/flow", flowRouter);

app.use("/config", configRouter);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
