define(["../clientUtil", "../skeleton", "text!../../functionSnippet/authentication.html"], function(clientUtil, skeletonMod, authenHtml) {

  let displayName = "test authentication client mod";

  let authenUi = {
    contentNode: null
  };

  let serverData = {
  };

  function refreshauthenUi() {
    authenUi.contentNode = new DOMParser().parseFromString(authenHtml, "text/html").getElementById("funcAuthentication");

  }

  async function refreshServerData() {
    try {
      let res = await clientUtil.ajaxPost("xxx", "xxx");
      if(res.isSuccess) {

      }else{
        console.log(res.error);
      };
    } catch(err) {
      console.log(err);
    };
  };

  // TODO should be refactored into some common module function
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
      skeletonMod.configureModal(
        promptNextModalConfig.modalHeaderNode,
        promptNextModalConfig.modalContentNode,
        async function() {
          skeletonMod.showLoadingSpinner();
          let isSuccess = await promptNextModalConfig.nextActionHandler();
          skeletonMod.hideLoadingSpinner();
          state = isSuccess ? "actionFulfilled" : "actionFailed";
          await proceedNext();
          return isSuccess;
        },
        null
      );
      skeletonMod.openModal();
    };

    // ---- server action fulfilled: Modal 1.1
    async function hintSuccess() {
      await skeletonMod.flashSuccessHint();
    };

    // ---- server action failed: Modal 1.2
    function promptActionFailure() {
      let modalHeaderNode = document.createElement("p");
      let modalContentNode = document.createElement("p");
      modalHeaderNode.textContent = "Heads Up!";
      modalContentNode.textContent = "Please open your browser console and take a screen capture for system admin.";
      skeletonMod.configureModal(
        modalHeaderNode,
        modalContentNode,
        null,
        null
      );
      skeletonMod.openModal();
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
      skeletonMod.configureModal(
        modalHeaderNode,
        modalContentNode,
        null,
        null
      );
      skeletonMod.openModal();
    };

    let validationRes = validators ? clientUtil.validateAll(validators) : { allPassed: true };
    state = validationRes.allPassed ? "validationPassed" : "validationFailed";
    proceedNext();

  }



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


  async function getInitializedContentNode(mode) {

    refreshauthenUi();
    // await refreshServerData();


    return authenUi.contentNode;
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
