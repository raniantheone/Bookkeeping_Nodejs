let cls = require('cls-hooked');
var path = require('path');
var config = require("../config/sysConfig");

let winston = require("winston");
let winstonConfig = winston.config;
let timeFormatUTC = function() {
  let dateObj = new Date();
  let year = dateObj.getUTCFullYear();
  let month = (+dateObj.getUTCMonth() + 1).toString();
  let date = dateObj.getUTCDate();
  let hours = dateObj.getUTCHours();
  let minutes = dateObj.getUTCMinutes();
  let seconds = dateObj.getUTCSeconds();
  let millis = dateObj.getUTCMilliseconds();
  function prependLeadingZero(input, expectDigits) {
    input = input.toString();
    if(input.length < expectDigits) {
      for(let i = 0; i < expectDigits - input.length; i++) {
        input = "0" + input;
      }
    }
    return input;
  };
  return year + "/" + prependLeadingZero(month, 2) + "/" + prependLeadingZero(date, 2) + "UTC" + prependLeadingZero(hours, 2) + ":" + prependLeadingZero(minutes, 2) + ":" + prependLeadingZero(seconds, 2) + ":" + prependLeadingZero(millis, 3);
};

function getRequestId() {
  let requestId = "";
  if(cls.getNamespace("testReqScope")) {
    requestId = cls.getNamespace("testReqScope").get("reqId");
  }
  return requestId;
};

function customFormat(options) {
  return options.timestamp() + "::" + getRequestId() + " " + winstonConfig.colorize(options.level, options.level.toUpperCase()) + " " + (options.message ? options.message : "");
};

let consoleTransport = new (winston.transports.Console)({
  timestamp: timeFormatUTC,
  formatter: customFormat
});

let fileTransport = new (winston.transports.File)({
  level: "info",
  colorize: true,
  timestamp: timeFormatUTC,
  formatter: customFormat,
  filename: path.join(__filename, "../../logs/application.log"),
  json: false
});

let transports = [];
transports.push(fileTransport);
if(config.env == "dev") {
  transports.push(consoleTransport);
};

let logger = new (winston.Logger)({
    transports: transports
});

exports.logger = logger;
