define(function() {

  var modalHeader = document.getElementById("modalHeader");
  var modalContentContainer = document.getElementById("modalContentContainer");
  var modalCancelCross = document.getElementById("modalCancelCross");
  var modalConfirmBtn = document.getElementById("modalConfirmBtn");
  var modalCancelBtn = document.getElementById("modalCancelBtn");

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

  function execIfItsAFunction(expectedFunction) {
    if(typeof expectedFunction == "function") {
      expectedFunction();
    }
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
    configureModal: function(modalHeaderNode, modalContentNode, confirmHandler, cancelHandler) {

      modalHeader.innerHTML = "";
      modalHeader.appendChild(modalHeaderNode);

      modalContentContainer.innerHTML = "";
      modalContentContainer.appendChild(modalContentNode);

      modalCancelCross.onclick = function() {
        execIfItsAFunction(cancelHandler);
        closeModal();
      };
      modalConfirmBtn.onclick = function() {
        execIfItsAFunction(confirmHandler);
        closeModal();
      };
      modalCancelBtn.onclick = function() {
        execIfItsAFunction(cancelHandler);
        closeModal();
      };

    },
    openModal: openModal,
    closeModal: closeModal
  };
});
