let cls = require('cls-hooked');

let winston = require("winston");
let config = winston.config;
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
}
let logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        timestamp: timeFormatUTC,
        formatter: function(options) {
          return options.timestamp() + "::" + getRequestId() + " " + config.colorize(options.level, options.level.toUpperCase()) + " " + (options.message ? options.message : "");
        }
      })
    ]
});

logger.error("customLogger instantiated");
logger.warn("customLogger instantiated");
logger.info("customLogger instantiated");
logger.verbose("customLogger instantiated");
logger.debug("customLogger instantiated");
logger.silly("customLogger instantiated");

exports.logger = logger;
