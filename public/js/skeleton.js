define(function() {

  var modalHeader = document.getElementById("modalHeader");
  var modalContentContainer = document.getElementById("modalContentContainer");
  var modalCancelCross = document.getElementById("modalCancelCross");
  var modalNextActionBtn = document.getElementById("modalNextActionBtn");
  var modalAbortBtn = document.getElementById("modalAbortBtn");
  var modalBgBase = document.getElementById("modalBgBase");
  var loadingSpinner = document.getElementById("loadingSpinner");
  var hintSuccess = document.getElementById("hintSuccess");

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
    loadFunctionContent: function(contentNode) {
      var functionContainer = document.getElementById("functionContainer");
      functionContainer.innerHTML = "";
      functionContainer.appendChild(contentNode);
    },
    loadFunctionHeader: function(headerText) {
      var functionNameHeader = document.getElementById("functionNameHeader");
      functionNameHeader.textContent = "";
      functionNameHeader.textContent = headerText;
    },
    configureModal: function(modalHeaderNode, modalContentNode, nextActionHandler, abortHandler) {

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

    },
    openModal: openModal,
    closeModal: closeModal,
    showLoadingSpinner: showLoadingSpinner,
    hideLoadingSpinner: hideLoadingSpinner,
    flashSuccessHint: async function() {
      showSuccessHint();
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          hideSuccessHint();
          resolve();
        }, 1000);
      });
    }
  };
});
