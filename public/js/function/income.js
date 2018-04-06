define(["../clientUtil", "../skeleton", "text!../../functionSnippet/income.html"], function(clientUtil, skeletonMod, incomeHtml) {

  let displayName = "Keep Income";

  let incomeUi = {
    contentNode: null,
    iptItemName: null,
    iptItemDesc: null,
    iptTransAmount: null,
    iptTransDateTime: null,
    selectDepo: null,
    depoPrefHeart: null,
    selectMngAcc: null,
    mngAccPrefHeart: null,
    btnKeepIncomeOK: null
  };

  let serverData = {
    availCombination: [],
    depoOpts: [],
    mngAccOpts: [],
    userPref: {}
  };

  function refreshIncomeUi() {
    incomeUi.contentNode = new DOMParser().parseFromString(incomeHtml, "text/html").getElementById("funcKeepIncome");
    incomeUi.iptItemName = incomeUi.contentNode.querySelector("#itemName");
    incomeUi.iptItemDesc = incomeUi.contentNode.querySelector("#itemDesc");
    incomeUi.iptTransAmount = incomeUi.contentNode.querySelector("#transAmount");
    incomeUi.iptTransDateTime = incomeUi.contentNode.querySelector("#transDateTime");
    incomeUi.selectDepo = incomeUi.contentNode.querySelector("#depo");
    incomeUi.depoPrefHeart = incomeUi.contentNode.querySelector("#depoPref");
    incomeUi.selectMngAcc = incomeUi.contentNode.querySelector("#mngAcc");
    incomeUi.mngAccPrefHeart = incomeUi.contentNode.querySelector("#mngAccPref");
    incomeUi.btnKeepIncomeOK = incomeUi.contentNode.querySelector("#keepIncomeOKBtn");
  }

  async function keepIncomeRecord() {
    skeletonMod.showLoadingSpinner();
    let payload = {
      itemName: incomeUi.iptItemName.value,
      itemDesc: incomeUi.iptItemDesc.value,
      transAmount: incomeUi.iptTransAmount.value,
      transDateTime: clientUtil.getDateObjFromDateIpt(incomeUi.iptTransDateTime.value).toISOString(),
      transType: "income",
      transIssuer: clientUtil.getUserFromCookie(), // TODO remove hardcode after auth implementation
      depo: incomeUi.selectDepo.value,
      mngAcc: incomeUi.selectMngAcc.value
    };
    if(incomeUi.depoPrefHeart.dataset.toggle == "on"
      && !(serverData.userPref.preferredIncomeDepo == incomeUi.selectDepo.value)) {
      payload.preferredIncomeDepo = incomeUi.selectDepo.value;
    }else if(incomeUi.depoPrefHeart.dataset.toggle == "off"
      && (serverData.userPref.preferredIncomeDepo == incomeUi.selectDepo.value)) {
      payload.preferredIncomeDepo = "cancelled";
    };
    if(incomeUi.mngAccPrefHeart.dataset.toggle == "on"
      && !(serverData.userPref.preferredIncomeMngAcc == incomeUi.selectMngAcc.value)) {
      payload.preferredIncomeMngAcc = incomeUi.selectMngAcc.value;
    }else if(incomeUi.mngAccPrefHeart.dataset.toggle == "off"
      && (serverData.userPref.preferredIncomeMngAcc == incomeUi.selectMngAcc.value)) {
      payload.preferredIncomeMngAcc = "cancelled";
    };
    console.log(payload);
    let isSuccess = false;
    try {
      let operResult = await clientUtil.ajaxPost("/flow/income/keepRecord", payload);
      skeletonMod.hideLoadingSpinner();

      if(Array.isArray(operResult.payload)) {
        let modalHeaderNode = document.createElement("span");
        modalHeaderNode.textContent = "Warning";
        let modalContentNode = document.createElement("p");
        modalContentNode.textContent = "Either you're testing the application, or someone is doing some tricky thing with your browser";
        let backendValidErrList = document.createElement("ul");
        operResult.payload.forEach((validErr) => {
          let item = document.createElement("li");
          item.textContent = validErr;
          backendValidErrList.appendChild(item);
        });
        modalContentNode.appendChild(backendValidErrList);
        skeletonMod.configureModal(
          modalHeaderNode
          , modalContentNode
          , null
          , null
        );
      }else if(!operResult.isSuccess) {
        console.log(operResult.error);
        throw new Error("Backend Error");
      }else{
        isSuccess = true;
        await skeletonMod.flashSuccessHint();
        skeletonMod.loadFunctionContent(await getInitializedContentNode());
      }

    } catch(err) {
      skeletonMod.hideLoadingSpinner();
      console.log(err);
      let modalHeaderNode = document.createElement("span");
      modalHeaderNode.textContent = "Oops...";
      let modalContentNode = document.createElement("p");
      modalContentNode.textContent = "Please notify system admin with this message: " + err + " ... at " + new Date().toISOString();
      skeletonMod.configureModal(
        modalHeaderNode
        , modalContentNode
        , null
        , null
      );
    };
    return isSuccess;
  }

  async function refreshServerData() {
    try {
      let res = await clientUtil.ajaxPost("/flow/income/getAvailDepoMngAccAndPref", {	ownerId: clientUtil.getUserFromCookie()});
      if(res.isSuccess) {
        serverData.availCombination = res.payload.availCombination;
        serverData.userPref = res.payload.userPref;

        serverData.depoOpts = [];
        serverData.mngAccOpts = [];

        let uniqueDepoIds = [];
        let uniqueMngAccIds = [];
        serverData.availCombination.forEach((combo) => {
          if(!uniqueDepoIds.includes(combo.depoId)) {
            uniqueDepoIds.push(combo.depoId);
            serverData.depoOpts.push({
              id: combo.depoId,
              displayName: combo.depoDisplayName
            });
          };
          if(!uniqueMngAccIds.includes(combo.mngAccId)) {
            uniqueMngAccIds.push(combo.mngAccId);
            serverData.mngAccOpts.push({
              id: combo.mngAccId,
              displayName: combo.mngAccDisplayName
            });
          };
        });
      }else{
        console.log(res.error);
      };
    } catch(err) {
      console.log(err);
    };
  };

  function setUpSelectDepoAndPref() {
    incomeUi.selectDepo.innerHTML = "";
    serverData.depoOpts.forEach((optData) => {
      let opt = document.createElement("option");
      opt.textContent = optData.displayName;
      opt.value = optData.id;
      incomeUi.selectDepo.appendChild(opt);
      if(serverData.userPref.preferredIncomeDepo && serverData.userPref.preferredIncomeDepo == opt.value) {
        opt.setAttribute("selected", true);
      };
    });
  };

  function setUpSelectMngAccAndPrefByDepo(depoId) {
    incomeUi.selectMngAcc.innerHTML = "";
    let matchedComboMngAccIds = serverData.availCombination.filter((combo) => {
      return depoId == combo.depoId;
    }).map((matchedCombo) => {
      return matchedCombo.mngAccId;
    });
    let availMngAccOpts = serverData.mngAccOpts.filter((optData) => {
      return matchedComboMngAccIds.includes(optData.id);
    });
    availMngAccOpts.forEach((optData) => {
      var opt = document.createElement("option");
      opt.textContent = optData.displayName;
      opt.value = optData.id;
      incomeUi.selectMngAcc.appendChild(opt);
      if(serverData.userPref.preferredIncomeMngAcc && serverData.userPref.preferredIncomeMngAcc == opt.value) {
        opt.setAttribute("selected", true);
      };
    });
  };

  function checkAndSetDepoHeart() {
    if(serverData.userPref.preferredIncomeDepo && serverData.userPref.preferredIncomeDepo == incomeUi.selectDepo.value) {
      incomeUi.depoPrefHeart.setAttribute("style", "font-weight: bold; color: red");
      incomeUi.depoPrefHeart.dataset.toggle = "on";
    }else{
      incomeUi.depoPrefHeart.setAttribute("style", "font-weight: bold; color: lightgrey");
      incomeUi.depoPrefHeart.dataset.toggle = "off";
    };
  };

  function checkAndSetMngAccHeart() {
    if(serverData.userPref.preferredIncomeMngAcc && serverData.userPref.preferredIncomeMngAcc == incomeUi.selectMngAcc.value) {
      incomeUi.mngAccPrefHeart.setAttribute("style", "font-weight: bold; color: red");
      incomeUi.mngAccPrefHeart.dataset.toggle = "on";
    }else{
      incomeUi.mngAccPrefHeart.setAttribute("style", "font-weight: bold; color: lightgrey");
      incomeUi.mngAccPrefHeart.dataset.toggle = "off";
    };
  };

  async function getInitializedContentNode() {

    refreshIncomeUi();
    await refreshServerData();

    // pop depo select and pref
    setUpSelectDepoAndPref();
    checkAndSetDepoHeart();

    // pop mngAcc select and pref
    setUpSelectMngAccAndPrefByDepo(incomeUi.selectDepo.value);
    checkAndSetMngAccHeart();

    incomeUi.iptTransDateTime.value = clientUtil.getDateIptStr(new Date());

    // register all event handlers
    incomeUi.selectDepo.addEventListener("change", function() {
      setUpSelectMngAccAndPrefByDepo(incomeUi.selectDepo.value);
      checkAndSetDepoHeart();
      checkAndSetMngAccHeart();
    });
    incomeUi.selectMngAcc.addEventListener("change", checkAndSetMngAccHeart);

    function togglePreference() {
      if(this.dataset.toggle == "on") {
        this.setAttribute("style", "font-weight: bold; color: lightgrey");
        this.dataset.toggle = "off";
      }else{
        this.setAttribute("style", "font-weight: bold; color: red");
        this.dataset.toggle = "on";
      }
    }
    incomeUi.depoPrefHeart.addEventListener("click", togglePreference);
    incomeUi.mngAccPrefHeart.addEventListener("click", togglePreference);

    incomeUi.btnKeepIncomeOK.addEventListener("click", function() {

      var itemNameValidator = clientUtil.createValidator(
        incomeUi.iptItemName,
        (itemNameVal) => { return itemNameVal.length > 0; },
        "Please provide item name."
      );
      var transAmountValidator = clientUtil.createValidator(
        incomeUi.iptTransAmount,
        (transAmountVal) => { return transAmountVal > 0; },
        "Please provide positive income amount."
      );
      var validationResult = clientUtil.validateAll([itemNameValidator, transAmountValidator]);

      var modalContentNode = document.createElement("p");
      var modalHeaderNode = document.createElement("span");
      if(validationResult.allPassed) {
        modalHeaderNode.textContent = "Confirm Income";
        modalContentNode.textContent = "Save "
          + incomeUi.iptTransAmount.value
          + " on "
          + incomeUi.iptItemName.value
          + " from "
          + incomeUi.selectDepo.options[incomeUi.selectDepo.selectedIndex].text
          + " - " + incomeUi.selectMngAcc.options[incomeUi.selectMngAcc.selectedIndex].text + " ?";
        skeletonMod.configureModal(
          modalHeaderNode
          , modalContentNode
          , keepIncomeRecord
          , null
        );
      }else{
        modalHeaderNode.textContent = "Oops...";
        modalContentNode.textContent = "Cannot keep this record, please refer to the advice below:";
        var errorList = document.createElement("ul");
        modalContentNode.appendChild(errorList);
        validationResult.errArr.forEach((errValidator) => {
          var listItem = document.createElement("li");
          listItem.textContent = errValidator.errMsg;
          errorList.appendChild(listItem);
        });
        skeletonMod.configureModal(
          modalHeaderNode
          , modalContentNode
          , null
          , null
        );
      }
      skeletonMod.openModal();

    });

    return incomeUi.contentNode;
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
