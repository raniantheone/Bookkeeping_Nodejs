define(["../clientUtil", "../skeleton", "text!../../functionSnippet/expense.html"], function(clientUtil, skeletonMod, expenseHtml) {

  let displayName = "test expense client mod";
  function InitData() {
    this.availCombination = [];
    this.depoOpts = [];
    this.mngAccOpts = [];
    this.userPref = {};
    this.refresh = async function() {

      this.availCombination = [];
      this.depoOpts = [];
      this.mngAccOpts = [];
      this.userPref = {};

      // TODO remove hardcode after auth implementation
      let res = await clientUtil.ajaxPost("/flow/expense/initData", {	ownerId: "trista167@gmail.com"});
      if(res.isSuccess) {
        this.availCombination = res.payload.availCombination;
        this.userPref = res.payload.userPref;
        let uniqueDepoIds = [];
        let uniqueMngAccIds = [];
        this.availCombination.forEach((combo) => {
          if(!uniqueDepoIds.includes(combo.depoId)) {
            uniqueDepoIds.push(combo.depoId);
            this.depoOpts.push({
              id: combo.depoId,
              displayName: combo.depoDisplayName
            });
          };
          if(!uniqueMngAccIds.includes(combo.mngAccId)) {
            uniqueMngAccIds.push(combo.mngAccId);
            this.mngAccOpts.push({
              id: combo.mngAccId,
              displayName: combo.mngAccDisplayName
            });
          };
        });
      }else{
        // TODO error handling
      }
    }
  }

  async function getInitContentNode() {

    var contentNode = new DOMParser().parseFromString(expenseHtml, "text/html").getElementById("funcKeepExpense");

    var initData = new InitData();
    await initData.refresh();

    var depoSelect = contentNode.querySelector("#depo");
    depoSelect.innerHTML = "";
    initData.depoOpts.forEach((optData) => {
      var opt = document.createElement("option");
      opt.textContent = optData.displayName;
      opt.value = optData.id;
      depoSelect.appendChild(opt);
      if(initData.userPref.preferredExpenseDepo && initData.userPref.preferredExpenseDepo == opt.value) {
        opt.setAttribute("selected", true);
      };
    });

    var mngAccSelect = contentNode.querySelector("#mngAcc");
    function setMngAccOptsByDepo(depoId) {
      mngAccSelect.innerHTML = "";

      var matchedComboMngAccIds = initData.availCombination.filter((combo) => {
        return depoId == combo.depoId;
      }).map((matchedCombo) => {
        return matchedCombo.mngAccId;
      });
      var availMngAccOpts = initData.mngAccOpts.filter((optData) => {
        return matchedComboMngAccIds.includes(optData.id);
      });
      availMngAccOpts.forEach((optData) => {
        var opt = document.createElement("option");
        opt.textContent = optData.displayName;
        opt.value = optData.id;
        mngAccSelect.appendChild(opt);
        if(initData.userPref.preferredExpenseMngAcc && initData.userPref.preferredExpenseMngAcc == opt.value) {
          opt.setAttribute("selected", true);
        };
      });
    }
    setMngAccOptsByDepo(depoSelect.value);

    // TODO preference pre-select here
    var depoPref = contentNode.querySelector("#depoPref");
    function checkPreferredDepoOption() {
      if(initData.userPref.preferredExpenseDepo && initData.userPref.preferredExpenseDepo == depoSelect.value) {
        depoPref.setAttribute("style", "font-weight: bold; color: red");
        depoPref.dataset.toggle = "on";
      }else{
        depoPref.setAttribute("style", "font-weight: bold; color: lightgrey");
        depoPref.dataset.toggle = "off";
      };
    };
    checkPreferredDepoOption();

    var mngAccPref = contentNode.querySelector("#mngAccPref");
    function checkPreferredMngAccOption() {
      if(initData.userPref.preferredExpenseMngAcc && initData.userPref.preferredExpenseMngAcc == mngAccSelect.value) {
        mngAccPref.setAttribute("style", "font-weight: bold; color: red");
        mngAccPref.dataset.toggle = "on";
      }else{
        mngAccPref.setAttribute("style", "font-weight: bold; color: lightgrey");
        mngAccPref.dataset.toggle = "off";
      };
    };
    checkPreferredMngAccOption();

    contentNode.querySelector("#transDateTime").value = clientUtil.getDateIptStr(new Date());

    depoSelect.addEventListener("change", function() {
      setMngAccOptsByDepo(depoSelect.value);
      checkPreferredDepoOption();
      checkPreferredMngAccOption();
    });

    mngAccSelect.addEventListener("change", checkPreferredMngAccOption);

    function togglePreference() {
      if(this.dataset.toggle == "on") {
        this.setAttribute("style", "font-weight: bold; color: lightgrey");
        this.dataset.toggle = "off";
      }else{
        this.setAttribute("style", "font-weight: bold; color: red");
        this.dataset.toggle = "on";
      }
    }

    depoPref.addEventListener("click", togglePreference);

    mngAccPref.addEventListener("click", togglePreference);

    return contentNode;
  };

  return {
    initialize: async function() {
      skeletonMod.loadFunctionContent(await getInitContentNode());
      skeletonMod.loadFunctionHeader(displayName);
    },
    getDisplayName: function() {
      return displayName;
    }
  }

});
