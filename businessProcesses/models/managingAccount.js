var hashUtil = require("../../utils/hash");

exports.buildManagingAccount = function(ownerId, displayName, editorIds, viewerIds) {
  return new ManagingAccount(ownerId, displayName, editorIds, viewerIds);
}

function ManagingAccount(ownerId, displayName, editorIds, viewerIds) {
  this.type = "mngAcc";
  this.ownerId = ownerId;
  this.displayName = displayName;
  this.editorIds = editorIds;
  this.viewerIds = viewerIds;
  this.id = this.ownerId + "::" + this.type + "::" + hashUtil.simpleHash(this.displayName + new Date().toISOString());
}
