define(["../clientUtil", "../skeleton", "text!../../functionSnippet/authentication.html"], function(clientUtil, skeletonMod, authenHtml) {

  let displayName = "test authentication client mod";

  let authenUi = {
    contentNode: null,
    userAcc: null,
    userPwd: null,
    keepExpenseOKBtn: null
  };

  function refreshAuthenUi() {
    authenUi.contentNode = new DOMParser().parseFromString(authenHtml, "text/html").getElementById("funcAuthentication");
    authenUi.userAcc = authenUi.contentNode.querySelector("#userAcc");
    authenUi.userPwd = authenUi.contentNode.querySelector("#userPwd");
    authenUi.keepExpenseOKBtn = authenUi.contentNode.querySelector("#keepExpenseOKBtn");
  }

  // TODO should be refactored into some common module function
  // This one does not prompt double confirm before executing server action
  async function loginActionWrapper(validators, serverAction) {

    let state = null;

    async function proceedNext() {
      switch(state) {
        case "validationPassed" :
          await execServerAction(serverAction);
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
    async function execServerAction(serverAction) {

      skeletonMod.showLoadingSpinner();
      let isSuccess = await serverAction();
      skeletonMod.hideLoadingSpinner();
      state = isSuccess ? "actionFulfilled" : "actionFailed";
      proceedNext();

    };

    // ---- server action fulfilled: Modal 1.1
    async function hintSuccess() {
      await skeletonMod.flashSuccessHint();
      window.location.replace("/bookkeeping/client.html");
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

  async function login(payload) {
    return await commonCUDActionWrapper("/auth/login", payload);
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


  function getInitializedContentNode(mode) {

    refreshAuthenUi();
    authenUi.keepExpenseOKBtn.addEventListener("click", function() {
      let payload = {
        ownerId: authenUi.userAcc.value,
        password: authenUi.userPwd.value
      };
      let userAccValidator = clientUtil.createValidator(
        authenUi.userAcc,
        (userAccVal) => {
          return userAccVal != undefined && userAccVal != null && userAccVal.length > 0;
        },
        "Please provide user account"
      );
      let userPwdValidator = clientUtil.createValidator(
        authenUi.userPwd,
        (userPwdVal) => {
          return userPwdVal != undefined && userPwdVal != null && userPwdVal.length > 0;
        },
        "Please provide user password"
      );
      loginActionWrapper([userAccValidator, userPwdValidator], async function() { return await login(payload); });
    });

    return authenUi.contentNode;

  };

  return {
    initialize: function() {
      skeletonMod.loadFunctionContent(getInitializedContentNode());
      skeletonMod.loadFunctionHeader(displayName);
    },
    getDisplayName: function() {
      return displayName;
    }
  }

});
