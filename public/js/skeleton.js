require.config({
  baseUrl: "js",
  paths: {
    text :"./lib/text"
  }
});

require(['text!../functionSnippet/expense.html', 'function/expense'], function(expenseHtml, expenseModule) {

  // document.getElementById("functionContainer").innerHTML = expenseHtml;
  var ele = new DOMParser().parseFromString(expenseHtml, "text/html").getElementById("funcKeepExpense");
  console.log(ele);
  document.getElementById("functionContainer").appendChild(ele);

  return {
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
    },
    loadFunctionContent: function(functionModule) {

      var functionContainer = document.getElementById("functionContainer");
      var functionNameHeader = document.getElementById("functionNameHeader");
      functionContainer.innerHTML = "";
      functionNameHeader.textContent = "";

      functionContainer.appendChild(functionModule.getModuleNode());
      functionNameHeader.textContent = functionModule.getFunctionName();

    }
  };
});
