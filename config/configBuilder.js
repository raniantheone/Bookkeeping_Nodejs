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
exports.buildConfigComponent = buildConfigComponent;
