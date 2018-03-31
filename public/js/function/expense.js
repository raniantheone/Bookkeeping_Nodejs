define(["../clientUtil", "../skeleton", "text!../../functionSnippet/expense.html"], function(clientUtil, skeletonMod, expenseHtml) {

  let displayName = "Keep Expense";

  let expenseUi = {
    contentNode: null,
    iptItemName: null,
    iptItemDesc: null,
    iptTransAmount: null,
    iptTransDateTime: null,
    selectDepo: null,
    depoPrefHeart: null,
    selectMngAcc: null,
    mngAccPrefHeart: null,
    btnKeepExpenseOK: null
  };

  let serverData = {
    availCombination: [],
    depoOpts: [],
    mngAccOpts: [],
    userPref: {}
  };

  function refreshExpenseUi() {
    expenseUi.contentNode = new DOMParser().parseFromString(expenseHtml, "text/html").getElementById("funcKeepExpense");
    expenseUi.iptItemName = expenseUi.contentNode.querySelector("#itemName");
    expenseUi.iptItemDesc = expenseUi.contentNode.querySelector("#itemDesc");
    expenseUi.iptTransAmount = expenseUi.contentNode.querySelector("#transAmount");
    expenseUi.iptTransDateTime = expenseUi.contentNode.querySelector("#transDateTime");
    expenseUi.selectDepo = expenseUi.contentNode.querySelector("#depo");
    expenseUi.depoPrefHeart = expenseUi.contentNode.querySelector("#depoPref");
    expenseUi.selectMngAcc = expenseUi.contentNode.querySelector("#mngAcc");
    expenseUi.mngAccPrefHeart = expenseUi.contentNode.querySelector("#mngAccPref");
    expenseUi.btnKeepExpenseOK = expenseUi.contentNode.querySelector("#keepExpenseOKBtn");
  }

  async function keepExpenseRecord() {
    skeletonMod.showLoadingSpinner();
    let payload = {
      itemName: expenseUi.iptItemName.value,
      itemDesc: expenseUi.iptItemDesc.value,
      transAmount: expenseUi.iptTransAmount.value,
      transDateTime: clientUtil.getDateObjFromDateIpt(expenseUi.iptTransDateTime.value).toISOString(),
      transType: "expense",
      transIssuer: "trista167@gmail.com", // TODO remove hardcode after auth implementation
      depo: expenseUi.selectDepo.value,
      mngAcc: expenseUi.selectMngAcc.value
    };
    if(expenseUi.depoPrefHeart.dataset.toggle == "on"
      && !(serverData.userPref.preferredExpenseDepo == expenseUi.selectDepo.value)) {
      payload.preferredExpenseDepo = expenseUi.selectDepo.value;
    }else if(expenseUi.depoPrefHeart.dataset.toggle == "off"
      && (serverData.userPref.preferredExpenseDepo == expenseUi.selectDepo.value)) {
      payload.preferredExpenseDepo = null;
    };
    if(expenseUi.mngAccPrefHeart.dataset.toggle == "on"
      && !(serverData.userPref.preferredExpenseMngAcc == expenseUi.selectMngAcc.value)) {
      payload.preferredExpenseMngAcc = expenseUi.selectMngAcc.value;
    }else if(expenseUi.mngAccPrefHeart.dataset.toggle == "off"
      && (serverData.userPref.preferredExpenseMngAcc == expenseUi.selectMngAcc.value)) {
      payload.preferredExpenseMngAcc = null;
    };
    console.log(payload);
    let isSuccess = false;
    try {
      let operResult = await clientUtil.ajaxPost("/flow/expense/keepRecord", payload);
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
      let res = await clientUtil.ajaxPost("/flow/expense/initData", {	ownerId: "trista167@gmail.com"});
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
    expenseUi.selectDepo.innerHTML = "";
    serverData.depoOpts.forEach((optData) => {
      let opt = document.createElement("option");
      opt.textContent = optData.displayName;
      opt.value = optData.id;
      expenseUi.selectDepo.appendChild(opt);
      if(serverData.userPref.preferredExpenseDepo && serverData.userPref.preferredExpenseDepo == opt.value) {
        opt.setAttribute("selected", true);
      };
    });
  };

  function setUpSelectMngAccAndPrefByDepo(depoId) {
    expenseUi.selectMngAcc.innerHTML = "";
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
      expenseUi.selectMngAcc.appendChild(opt);
      if(serverData.userPref.preferredExpenseMngAcc && serverData.userPref.preferredExpenseMngAcc == opt.value) {
        opt.setAttribute("selected", true);
      };
    });
  };

  function checkAndSetDepoHeart() {
    if(serverData.userPref.preferredExpenseDepo && serverData.userPref.preferredExpenseDepo == expenseUi.selectDepo.value) {
      expenseUi.depoPrefHeart.setAttribute("style", "font-weight: bold; color: red");
      expenseUi.depoPrefHeart.dataset.toggle = "on";
    }else{
      expenseUi.depoPrefHeart.setAttribute("style", "font-weight: bold; color: lightgrey");
      expenseUi.depoPrefHeart.dataset.toggle = "off";
    };
  };

  function checkAndSetMngAccHeart() {
    if(serverData.userPref.preferredExpenseMngAcc && serverData.userPref.preferredExpenseMngAcc == expenseUi.selectMngAcc.value) {
      expenseUi.mngAccPrefHeart.setAttribute("style", "font-weight: bold; color: red");
      expenseUi.mngAccPrefHeart.dataset.toggle = "on";
    }else{
      expenseUi.mngAccPrefHeart.setAttribute("style", "font-weight: bold; color: lightgrey");
      expenseUi.mngAccPrefHeart.dataset.toggle = "off";
    };
  };

  async function getInitializedContentNode() {

    refreshExpenseUi();
    await refreshServerData();

    // pop depo select and pref
    setUpSelectDepoAndPref();
    checkAndSetDepoHeart();

    // pop mngAcc select and pref
    setUpSelectMngAccAndPrefByDepo(expenseUi.selectDepo.value);
    checkAndSetMngAccHeart();

    expenseUi.iptTransDateTime.value = clientUtil.getDateIptStr(new Date());

    // register all event handlers
    expenseUi.selectDepo.addEventListener("change", function() {
      setUpSelectMngAccAndPrefByDepo(expenseUi.selectDepo.value);
      checkAndSetDepoHeart();
      checkAndSetMngAccHeart();
    });
    expenseUi.selectMngAcc.addEventListener("change", checkAndSetMngAccHeart);

    function togglePreference() {
      if(this.dataset.toggle == "on") {
        this.setAttribute("style", "font-weight: bold; color: lightgrey");
        this.dataset.toggle = "off";
      }else{
        this.setAttribute("style", "font-weight: bold; color: red");
        this.dataset.toggle = "on";
      }
    }
    expenseUi.depoPrefHeart.addEventListener("click", togglePreference);
    expenseUi.mngAccPrefHeart.addEventListener("click", togglePreference);

    expenseUi.btnKeepExpenseOK.addEventListener("click", function() {

      var itemNameValidator = clientUtil.createValidator(
        expenseUi.iptItemName,
        (itemNameVal) => { return itemNameVal.length > 0; },
        "Please provide item name."
      );
      var transAmountValidator = clientUtil.createValidator(
        expenseUi.iptTransAmount,
        (transAmountVal) => { return transAmountVal > 0; },
        "Please provide positive expense amount."
      );
      var validationResult = clientUtil.validateAll([itemNameValidator, transAmountValidator]);

      var modalContentNode = document.createElement("p");
      var modalHeaderNode = document.createElement("span");
      if(validationResult.allPassed) {
        modalHeaderNode.textContent = "Confirm Expense";
        modalContentNode.textContent = "Spend "
          + expenseUi.iptTransAmount.value
          + " on "
          + expenseUi.iptItemName.value
          + " from "
          + expenseUi.selectDepo.options[expenseUi.selectDepo.selectedIndex].text
          + " - " + expenseUi.selectMngAcc.options[expenseUi.selectMngAcc.selectedIndex].text + " ?";
        skeletonMod.configureModal(
          modalHeaderNode
          , modalContentNode
          , keepExpenseRecord
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

    return expenseUi.contentNode;
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
