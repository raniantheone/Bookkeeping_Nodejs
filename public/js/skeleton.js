define(function() {

  var sideNav = document.getElementById("sideNav");
  document.getElementById("sideNavOpenBtn").addEventListener("click", function() {
    sideNav.style.display = "block";
  });
  document.getElementById("sideNavCloseBtn").addEventListener("click", function() {
    sideNav.style.display = "none";
  });

  return {
    registerNavFunction: function(functionMod) {
      var navFunctionItem = document.createElement("a");
      navFunctionItem.setAttribute("class", "w3-bar-item w3-button");
      navFunctionItem.setAttribute("href", "#");
      navFunctionItem.textContent = functionMod.getDisplayName();
      navFunctionItem.addEventListener("click", functionMod.initialize);
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



    initSkeleton: function() {

      // Load function list in sideNav

      // Register click handler which loads function content for each function in sideNav

      // Load default function

    },
    openSideNav: function() {
      document.getElementById("sideNav").style.display = "block";
    },
    closeSideNav: function() {
      document.getElementById("sideNav").style.display = "none";
    },
    openModal: function(functionModule) {

      var modalHeader = document.getElementById("modalHeader");
      var modalContentContainer = document.getElementById("modalContentContainer");
      modalHeader.textContent = "";
      modalContentContainer.innerHTML = "";

      modalHeader.textContent = functionModule.getModalHeaderText();
      modalContentContainer.appendChild(functionModule.getModalContent());

      document.getElementById("modalContainer").style.display="block";

    },
    closeModal: function() {
      document.getElementById("modalContainer").style.display="none";
    }

  };
});
