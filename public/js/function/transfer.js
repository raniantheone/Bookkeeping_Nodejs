define(["../clientUtil", "../skeleton", "text!../../functionSnippet/transfer.html"], function(clientUtil, skeletonMod, transferHtml) {

  let displayName = "test transfer client mod";

  let transferUi = {
    contentNode: null,
    sourceCombo: null,
    sourcePickHint: null,
    sourceComboContainer: null,
    targetCombo: null,
    targetPickHint: null,
    targetComboContainer: null,
    pickList: null,
    listRowTmpl: null,
    sourceArea: null,
    targetArea: null
  };

  let serverData = {
    depos: [],
    mngAccs: [],
    combos: []
  };

  function refreshtransferUi() {
    transferUi.contentNode = new DOMParser().parseFromString(transferHtml, "text/html").getElementById("funcConfiguration");
    transferUi.sourceCombo = transferUi.contentNode.querySelector("#sourceCombo");
    transferUi.sourcePickHint = transferUi.contentNode.querySelector("#sourcePickHint");
    transferUi.sourceComboContainer = transferUi.contentNode.querySelector("#sourceComboContainer");
    transferUi.targetCombo = transferUi.contentNode.querySelector("#targetCombo");
    transferUi.targetPickHint = transferUi.contentNode.querySelector("#targetPickHint");
    transferUi.targetComboContainer = transferUi.contentNode.querySelector("#targetComboContainer");
    transferUi.pickList = transferUi.contentNode.querySelector("#pickList");
    transferUi.listRowTmpl = transferUi.contentNode.querySelector("#listRowTmpl");
    transferUi.sourceArea = transferUi.contentNode.querySelector("#sourceArea");
    transferUi.targetArea = transferUi.contentNode.querySelector("#targetArea");
  }

  async function refreshServerData() {
    try {
      let res = await clientUtil.ajaxPost("/flow/transfer/getTransferableDepoMngAcc", {	ownerId: "trista167@gmail.com"});
      if(res.isSuccess) {
        serverData.depos = res.payload.depos;
        serverData.mngAccs = res.payload.mngAccs;
        serverData.combos = res.payload.initializedDataArr.sort(function(prev, next) { return prev.depoId.localeCompare(next.depoId); });
      }else{
        console.log(res.error);
      };
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


  async function addDespository(payload) {
    return await commonCUDActionWrapper("/config/addDepo", payload);
  };

  // CUD stands for these server actions: Create, Update, Delete
  async function commonCUDActionWrapper(url, payload) {
    let isSuccess = false;
    try {
      let result = await clientUtil.ajaxPost(url, payload);
      if(!result.isSuccess) {
        console.log(result.error);
        throw new Error("Backend Error");
      }else if(Array.isArray(result.payload)) {
        let errorContent = result.payload.join(", ");
        console.log(errorContent);
        throw new Error("Client Data Has Been Forged Error");
      }else{
        isSuccess = true;
      }
    } catch(error) {
      console.log(error);
    };
    return isSuccess;
  };

  function buildPickList(serverDataCombos, source, target) {

    let pickList = {
      nodeRepresentation: transferUi.pickList,
      currentTarget: null, // id of sourceCombo or targetCombo
      showPickList: function(targetId) {
        transferUi.targetArea.style.display = "none";
        transferUi.sourceArea.style.display = "none";
        transferUi.pickList.style.display = "block";
        currentTarget = targetId;
      },
      hidePickList: function(selectedRow) {
        if(currentTarget == "sourceCombo") {
          source.showSourceData(
            selectedRow.querySelector("[name=depoDisplayName]").dataset.depoId,
            selectedRow.querySelector("[name=mngAccDisplayName]").dataset.mngAccId,
            selectedRow.querySelector("[name=comboCurrentBalance]").dataset.balance
          );
        }else{
          target.showTargetData(
            selectedRow.querySelector("[name=depoDisplayName]").dataset.depoId,
            selectedRow.querySelector("[name=mngAccDisplayName]").dataset.mngAccId,
            selectedRow.querySelector("[name=comboCurrentBalance]").dataset.balance
          );
        };
        transferUi.pickList.style.display = "none";
        transferUi.targetArea.style.display = "block";
        transferUi.sourceArea.style.display = "block";
      }
    };

    transferUi.pickList.innerHTML = "";
    serverDataCombos.forEach((combo) => {
      let comboRow = transferUi.listRowTmpl.cloneNode(true);
      comboRow.removeAttribute("id");
      let depoDisplayName = comboRow.querySelector("[name=depoDisplayName]");
      depoDisplayName.textContent = getDepoDisplayName(combo.depoId);
      depoDisplayName.dataset.depoId = combo.depoId;
      let mngAccDisplayName = comboRow.querySelector("[name=mngAccDisplayName]");
      mngAccDisplayName.textContent = getMngAccDisplayName(combo.mngAccId);
      mngAccDisplayName.dataset.mngAccId = combo.mngAccId;
      let comboCurrentBalance = comboRow.querySelector("[name=comboCurrentBalance]");
      comboCurrentBalance.textContent = combo.currentBalance;
      comboCurrentBalance.dataset.balance = combo.currentBalance;
      let pickBtn = comboRow.querySelector("[name=pickBtn]");
      pickBtn.addEventListener("click", function() {
        // TODO
        console.log("dev ing");
        pickList.hidePickList(comboRow);
      });
      transferUi.pickList.appendChild(comboRow);
    });

    return pickList;
  };

  function buildSource() {

    let source = {
      nodeRepresentation: null,
      depoId: null,
      mngAccId: null,
      currentBalance: null,
      afterBalance: null,
      showSourceData: function(depoId, mngAccId, currentBalance) {
        this.depoId = depoId;
        this.mngAccId = mngAccId;
        this.currentBalance = parseInt(currentBalance);
        this.nodeRepresentation.querySelector("[name=depoDisplayName]").textContent = getDepoDisplayName(depoId);
        this.nodeRepresentation.querySelector("[name=depoDisplayName]").dataset.depoId = depoId;
        this.nodeRepresentation.querySelector("[name=mngAccDisplayName]").textContent = getMngAccDisplayName(mngAccId);
        this.nodeRepresentation.querySelector("[name=mngAccDisplayName]").dataset.mngAccId = mngAccId;
        this.nodeRepresentation.querySelector("[name=comboCurrentBalance]").textContent = "current: " + currentBalance;
        this.nodeRepresentation.querySelector("[name=comboCurrentBalance]").dataset.balance = currentBalance;
        transferUi.sourcePickHint.style.display = "none";
        transferUi.sourceComboContainer.style.display = "block";
      },
      updateAfterBalance: function(transferAmount) {
        this.afterBalance = parseInt(this.currentBalance) + parseInt(transferAmount);
        this.nodeRepresentation.querySelector("[name=comboAfterBalance]").textContent = "after: " + this.afterBalance;
        this.nodeRepresentation.querySelector("[name=comboAfterBalance]").dataset.balance = this.afterBalance;
      },
      showEmpty: function() {
        transferUi.sourceComboContainer.style.display = "none";
        transferUi.sourcePickHint.style.display = "block";
      }
    };

    source.nodeRepresentation = transferUi.sourceComboContainer;
    source.showEmpty();

    return source;
  };

  function buildTarget() {

    let target = {
      nodeRepresentation: null,
      depoId: null,
      mngAccId: null,
      currentBalance: null,
      afterBalance: null,
      showTargetData: function(depoId, mngAccId, currentBalance) {
        this.depoId = depoId;
        this.mngAccId = mngAccId;
        this.currentBalance = parseInt(currentBalance);
        this.nodeRepresentation.querySelector("[name=depoDisplayName]").textContent = getDepoDisplayName(depoId);
        this.nodeRepresentation.querySelector("[name=depoDisplayName]").dataset.depoId = depoId;
        this.nodeRepresentation.querySelector("[name=mngAccDisplayName]").textContent = getMngAccDisplayName(mngAccId);
        this.nodeRepresentation.querySelector("[name=mngAccDisplayName]").dataset.mngAccId = mngAccId;
        this.nodeRepresentation.querySelector("[name=comboCurrentBalance]").textContent = "current: " + currentBalance;
        this.nodeRepresentation.querySelector("[name=comboCurrentBalance]").dataset.balance = currentBalance;
        transferUi.targetPickHint.style.display = "none";
        transferUi.targetComboContainer.style.display = "block";
      },
      updateAfterBalance: function(transferAmount) {
        this.afterBalance = parseInt(this.currentBalance) + parseInt(transferAmount);
        this.nodeRepresentation.querySelector("[name=comboAfterBalance]").textContent = "after: " + this.afterBalance;
        this.nodeRepresentation.querySelector("[name=comboAfterBalance]").dataset.balance = this.afterBalance;
      },
      showEmpty: function() {
        transferUi.targetComboContainer.style.display = "none";
        transferUi.targetPickHint.style.display = "block";
      }
    };

    target.nodeRepresentation = transferUi.targetComboContainer;
    target.showEmpty();

    return target;
  };

  async function getInitializedContentNode(mode) {
    refreshtransferUi();
    await refreshServerData();

    let source = buildSource();
    let target = buildTarget();
    let pickList = buildPickList(serverData.combos, source, target);
    transferUi.sourceCombo.addEventListener("click", function() { pickList.showPickList("sourceCombo"); });
    transferUi.targetCombo.addEventListener("click", function() { pickList.showPickList("targetCombo"); });

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
