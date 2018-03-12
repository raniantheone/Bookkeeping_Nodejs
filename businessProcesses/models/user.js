exports.buildUser = function(ownerId, password, authType, displayName, registeredDateTime) {
  return new User(ownerId, password, authType, displayName, registeredDateTime);
}

function User(ownerId, password, authType, displayName, registeredDateTime) {
  this.type = "user";
  this.ownerId = ownerId;
  this.password = password;
  this.authType = authType;
  this.displayName = displayName;
  this.registeredDateTime = registeredDateTime;
  this.id = this.ownerId + "::" + this.type;
}
