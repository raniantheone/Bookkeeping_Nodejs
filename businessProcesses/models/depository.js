var hashUtil = require("../../utils/hash");

exports.buildDepository = function(ownerId, displayName, editorIds, viewerIds) {
  return new Depository(ownerId, displayName, editorIds, viewerIds);
}

function Depository(ownerId, displayName, editorIds, viewerIds) {
  this.type = "depo";
  this.ownerId = ownerId;
  this.displayName = displayName;
  this.editorIds = editorIds;
  this.viewerIds = viewerIds;
  this.id = this.ownerId + "::" + this.type + "::" + hashUtil.simpleHash(this.displayName + new Date().toISOString());
}
