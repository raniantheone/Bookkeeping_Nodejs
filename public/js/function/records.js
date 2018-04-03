define(["../clientUtil", "../skeleton", "text!../../functionSnippet/records.html"], function(clientUtil, skeletonMod, recordsHtml) {

  let displayName = "Check Records";

  let transferUi = {
  };

  let serverData = {
  };

  function refreshTransferUi() {
    transferUi.contentNode = new DOMParser().parseFromString(recordsHtml, "text/html").getElementById("funcCheckRecords");
  }

  async function refreshServerData() {
    try {

    } catch(err) {
      console.log(err);
    };
  };

  function getDepoDisplayName(depoId) {
    let [{displayName:name}] = serverData.depos.filter((depo) => {
      return depo.id == depoId;
    });
    return name;
  };

  function getMngAccDisplayName(mngAccId) {
    let [{displayName:name}] = serverData.mngAccs.filter((mngAcc) => {
      return mngAcc.id == mngAccId;
    });
    return name;
  };

  async function getInitializedContentNode(mode) {
    refreshTransferUi();
    // await refreshServerData();


    return transferUi.contentNode;
  };

  return {
    initialize: async function() {
      skeletonMod.loadFunctionContent(await getInitializedContentNode());
      skeletonMod.loadFunctionHeader(displayName);
    },
    getDisplayName: function() {
      return displayName;
    }
  }

});
