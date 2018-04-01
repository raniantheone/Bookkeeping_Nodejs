define(["./clientUtil"], function(clientUtil) {

  var modalHeader = document.getElementById("modalHeader");
  var modalContentContainer = document.getElementById("modalContentContainer");
  var modalCancelCross = document.getElementById("modalCancelCross");
  var modalNextActionBtn = document.getElementById("modalNextActionBtn");
  var modalAbortBtn = document.getElementById("modalAbortBtn");
  var modalBgBase = document.getElementById("modalBgBase");
  var loadingSpinner = document.getElementById("loadingSpinner");
  var hintSuccess = document.getElementById("hintSuccess");
  var functionHeaderBar = document.getElementsByClassName("w3-top")[0];

  function openSideNav() {
    document.getElementById("sideNav").style.display = "block";
  }

  function closeSideNav() {
    document.getElementById("sideNav").style.display = "none";
  }

  function openModal() {
    document.getElementById("modalContainer").style.display="block";
  }

  function closeModal() {
    document.getElementById("modalContainer").style.display="none";
  }

  async function execIfItsAFunction(expectedFunction) {
    if(typeof expectedFunction == "function") {
      return await expectedFunction();
    }
  }

  function showLoadingSpinner() {
    modalBgBase.style.display="none";
    loadingSpinner.style.display="block";
  }

  function hideLoadingSpinner() {
    loadingSpinner.style.display="none";
    modalBgBase.style.display="block";
  }

  function showSuccessHint() {
    modalBgBase.style.display="none";
    hintSuccess.style.display="block";
  }

  function hideSuccessHint() {
    hintSuccess.style.display="none";
    modalBgBase.style.display="block";
  }

  async function flashSuccessHint() {
    showSuccessHint();
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        hideSuccessHint();
        resolve();
      }, 1000);
    });
  }

  function serverActionWrapper(validators, promptNextModalConfig) {

    let state = null;

    async function proceedNext() {
      switch(state) {
        case "validationPassed" :
          promptDoubleConfirmation();
          break;
        case "validationFailed" :
          promptValidationFailed();
          break;
        case "actionFulfilled" :
          await hintSuccess();
          break;
        case "actionFailed" :
          promptActionFailure();
          break;
      };
    };

    // -- passed validation: Modal 1
    function promptDoubleConfirmation() {
      configureModal(
        promptNextModalConfig.modalHeaderNode,
        promptNextModalConfig.modalContentNode,
        async function() {
          showLoadingSpinner();
          let isSuccess = await promptNextModalConfig.nextActionHandler();
          hideLoadingSpinner();
          state = isSuccess ? "actionFulfilled" : "actionFailed";
          await proceedNext();
          return isSuccess;
        },
        null
      );
      openModal();
    };

    // ---- server action fulfilled: Modal 1.1
    async function hintSuccess() {
      await flashSuccessHint();
    };

    // ---- server action failed: Modal 1.2
    function promptActionFailure() {
      let modalHeaderNode = document.createElement("p");
      let modalContentNode = document.createElement("p");
      modalHeaderNode.textContent = "Heads Up!";
      modalContentNode.textContent = "Please open your browser console and take a screen capture for system admin.";
      configureModal(
        modalHeaderNode,
        modalContentNode,
        null,
        null
      );
      openModal();
    };

    // -- failed validation: Modal 2
    function promptValidationFailed() {
      let modalHeaderNode = document.createElement("p");
      let modalContentNode = document.createElement("ul");
      modalHeaderNode.textContent = "Oops...";
      modalContentNode.textContent = "Please follow the advice below:";
      validationRes.errArr.forEach((errValidator) => {
        let errItem = document.createElement("li");
        errItem.textContent = errValidator.errMsg;
        modalContentNode.appendChild(errItem);
      });
      configureModal(
        modalHeaderNode,
        modalContentNode,
        null,
        null
      );
      openModal();
    };

    let validationRes = validators ? clientUtil.validateAll(validators) : { allPassed: true };
    state = validationRes.allPassed ? "validationPassed" : "validationFailed";
    proceedNext();

  }

  function configureModal(modalHeaderNode, modalContentNode, nextActionHandler, abortHandler) {

    modalHeader.innerHTML = "";
    modalHeader.appendChild(modalHeaderNode);

    modalContentContainer.innerHTML = "";
    modalContentContainer.appendChild(modalContentNode);

    modalCancelCross.onclick = function() {
      execIfItsAFunction(abortHandler);
      closeModal();
    };
    modalNextActionBtn.onclick = async function() {
      let nextActionSucceed = await execIfItsAFunction(nextActionHandler);
      if(nextActionSucceed) {
        closeModal(); // nextActionHandler will configure modal again if the action is not fulfilled
      };
    };
    modalAbortBtn.onclick = function() {
      execIfItsAFunction(abortHandler);
      closeModal();
    };

    let divAbortBtn = modalAbortBtn.parentNode;
    let divNextActionBtn = modalNextActionBtn.parentNode;
    if(nextActionHandler == null) {
      modalAbortBtn.textContent = "Got it";
      divAbortBtn.setAttribute("class", "w3-padding w3-col s12 m12 l12");
      divNextActionBtn.style.display = "none";
    }else{
      modalAbortBtn.textContent = "Abort";
      divAbortBtn.setAttribute("class", "w3-padding w3-col s6 m6 l6");
      divNextActionBtn.style.display = "block";
    };

  }

  function loadFunctionContent(contentNode) {
    var functionContainer = document.getElementById("functionContainer");
    functionContainer.innerHTML = "";
    functionContainer.appendChild(contentNode);
  }

  function hideFunctionHeaderBar() {
    functionHeaderBar.style.display = "none";
  }

  function showFunctionHeaderBar() {
    functionHeaderBar.style.display = "block";
  }

  document.getElementById("sideNavOpenBtn").addEventListener("click", openSideNav);
  document.getElementById("sideNavCloseBtn").addEventListener("click", closeSideNav);

  return {
    registerNavFunction: function(functionMod) {
      var navFunctionItem = document.createElement("a");
      navFunctionItem.setAttribute("class", "w3-bar-item w3-button");
      navFunctionItem.setAttribute("href", "#");
      navFunctionItem.textContent = functionMod.getDisplayName();
      navFunctionItem.onclick = function() {
        functionMod.initialize();
        closeSideNav();
      };
      document.getElementById("navFunctionList").appendChild(navFunctionItem);
    },
    loadFunctionContent: loadFunctionContent,
    loadFunctionHeader: function(headerText) {
      var functionNameHeader = document.getElementById("functionNameHeader");
      functionNameHeader.textContent = "";
      functionNameHeader.textContent = headerText;
    },
    configureModal: configureModal,
    openModal: openModal,
    closeModal: closeModal,
    showLoadingSpinner: showLoadingSpinner,
    hideLoadingSpinner: hideLoadingSpinner,
    flashSuccessHint: flashSuccessHint,
    serverActionWrapper: serverActionWrapper,
    hideFunctionHeaderBar: hideFunctionHeaderBar,
    showFunctionHeaderBar: showFunctionHeaderBar
  };
});
