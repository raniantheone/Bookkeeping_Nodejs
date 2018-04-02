let env = process.env.ENV;

// default config
function buildConfigComponent() {
  return new Proxy({}, {
    get: function(target, property, receiver) {
      if(target[property] == undefined) {
        target[property] = buildConfigComponent();
      };
      return Reflect.get(target, property);
    }
  });
};
let config = buildConfigComponent();

config.env = env;
config.test = "test from default";
config.authenMaxAgeSec = 300;

config.couchbase.errorCode.noSuchKey = 13;


// override default with env specific key-value
let envSpecificConfig = require("./sysConfig_" + env);
if(envSpecificConfig) {
  for(var speProp in envSpecificConfig) {
    config[speProp] = envSpecificConfig[speProp];
  }
};
console.log(config);

module.exports = config;
