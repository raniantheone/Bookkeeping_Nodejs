var hashUtil = require("../../utils/hash");

exports.buildExpenseRecord = function(ownerId, editorIds, viewerIds, itemName, itemDesc, transAmount, transDateTime, transType, transIssuer, depo, mngAcc) {
  return new ExpenseRecord(ownerId, editorIds, viewerIds, itemName, itemDesc, transAmount, transDateTime, transType, transIssuer, depo, mngAcc);
}

function ExpenseRecord(ownerId, editorIds, viewerIds, itemName, itemDesc, transAmount, transDateTime, transType, transIssuer, depo, mngAcc) {
  this.type = "expense";
  this.ownerId = ownerId;
  this.editorIds = editorIds;
  this.viewerIds = viewerIds;
  this.itemName = itemName;
  this.itemDesc = (itemDesc == null || itemDesc == undefined) ? "" : itemDesc;
  this.transAmount = parseInt(transAmount);
  this.transDateTime = transDateTime;
  this.transType = transType;
  this.transIssuer = transIssuer;
  this.depo = depo;
  this.mngAcc = mngAcc;
  this.id = this.ownerId + "::" + this.type + "::" + this.transDateTime.toISOString().split("T")[0].replace(/-/gi, "") + "::" + hashUtil.simpleHash(this.itemName + this.itemDesc + this.transAmount + this.depo + this.mngAcc + this.transType + this.transDateTime);
};
