let env = process.env.NODE_ENV || "development";
let envSpecificConfig = require("./sysConfig_" + env);
if(!envSpecificConfig) {
  envSpecificConfig = require("./sysConfig_default");
};

envSpecificConfig.env = env;
console.log(envSpecificConfig);

module.exports = envSpecificConfig;
