define(["../clientUtil", "../skeleton", "text!../../functionSnippet/configuration.html"], function(clientUtil, skeletonMod, configHtml) {

  let displayName = "test configuration client mod";

  let configUi = {
    contentNode: null,
    depoListToggle: null,
    depoList: null,
    depoItemTmpl_Read_: null,
    depoItemTmpl_Edit_: null,
    depoItem_Add: null,
    mngAccListToggle: null,
    mngAccList: null,
    mngAccItemTmpl_Read_: null,
    mngAccItemTmpl_Edit_: null,
    mngAccItem_Add: null,
    comboListToggle: null,
    comboList: null,
    comboItemTmpl_InitEdit_: null,
    comboItemTmpl_Read_: null,
    comboItemTmpl_Edit_: null,
    comboItem_Add: null
  };

  let serverData = {
    depos: [],
    mngAccs: [],
    initializedCombo: []
  };

  function getDepoDisplayName(depoId) {
    let [{displayName:name}] = serverData.depos.filter((depo) => {
      return depo.id == depoId;
    });
    return name;
  };

  function getMngAccDisplayName(mngAccId) {
    let [{displayName:name}] = serverData.mngAccs.filter((mngAcc) => {
      return mngAcc.id == mngAccId;
    });
    return name;
  };

  function refreshconfigUi() {
    configUi.contentNode = new DOMParser().parseFromString(configHtml, "text/html").getElementById("funcConfiguration");
    configUi.depoListToggle = configUi.contentNode.querySelector("#depoListToggle");
    configUi.depoList = configUi.contentNode.querySelector("#depoList");
    configUi.depoItemTmpl_Read_ = configUi.contentNode.querySelector("#depoItemTmpl_Read_");
    configUi.depoItemTmpl_Edit_ = configUi.contentNode.querySelector("#depoItemTmpl_Edit_");
    configUi.depoItem_Add = configUi.contentNode.querySelector("#depoItem_Add");
    configUi.mngAccListToggle = configUi.contentNode.querySelector("#mngAccListToggle");
    configUi.mngAccList = configUi.contentNode.querySelector("#mngAccList");
    configUi.mngAccItemTmpl_Read_ = configUi.contentNode.querySelector("#mngAccItemTmpl_Read_");
    configUi.mngAccItemTmpl_Edit_ = configUi.contentNode.querySelector("#mngAccItemTmpl_Edit_");
    configUi.mngAccItem_Add = configUi.contentNode.querySelector("#mngAccItem_Add");
    configUi.comboListToggle = configUi.contentNode.querySelector("#comboListToggle");
    configUi.comboList = configUi.contentNode.querySelector("#comboList");
    configUi.comboItemTmpl_InitEdit_ = configUi.contentNode.querySelector("#comboItemTmpl_InitEdit_");
    configUi.comboItemTmpl_Read_ = configUi.contentNode.querySelector("#comboItemTmpl_Read_");
    configUi.comboItemTmpl_Edit_ = configUi.contentNode.querySelector("#comboItemTmpl_Edit_");
    configUi.comboItem_Add = configUi.contentNode.querySelector("#comboItem_Add");
  }

  async function refreshServerData() {
    try {
      let res = await clientUtil.ajaxPost("/config/currentDepoMngAcc", {	ownerId: "trista167@gmail.com"});
      if(res.isSuccess) {
        serverData.depos = res.payload.depos.sort(function(prev, next) { return prev.displayName.localeCompare(next.displayName); });
        serverData.mngAccs = res.payload.mngAccs.sort(function(prev, next) { return prev.displayName.localeCompare(next.displayName); });
        serverData.initializedCombo = res.payload.initialized.sort(function(prev, next) { return prev.depoId.localeCompare(next.depoId); });
      }else{
        console.log(res.error);
      };
    } catch(err) {
      console.log(err);
    };
  };

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


  function buildDepoItem(state, depoId, displayName) {

    // state value range: [empty, edit, read]
    let nodeRepresentation = null;
    let lastRepresentation = null;
    let depoItem = null;

    depoItem = {

      switchToEdit: function() {
        lastRepresentation = nodeRepresentation;
        let node = configUi.depoItemTmpl_Edit_.cloneNode(true);
        node.setAttribute("id", depoId ? depoId : "addDepo");
        let displayNameText = node.querySelector("[name=displayName]");
        displayNameText.value = displayName ? displayName : "";
        let confirmBtn = node.querySelector("[name=confirmBtn]");
        confirmBtn.addEventListener("click", function() {

          let payload = {
            ownerId: "trista167@gmail.com", // TODO remove hardcode
            displayName: displayNameText.value
          }
          if(depoId && depoId.length > 0) {

            payload.depoId = depoId;

            let promptNextModalConfig = {
              modalHeaderNode: document.createElement("p"),
              modalContentNode: document.createElement("p"),
              nextActionHandler: async function() {
                let isSuccess = await updateDespository(payload);
                if(isSuccess) {
                  skeletonMod.loadFunctionContent(await getInitializedContentNode("depo"));
                }
                return isSuccess;
              }
            };
            promptNextModalConfig.modalHeaderNode.textContent = "Update Depository";
            promptNextModalConfig.modalContentNode.textContent = "Update depository name from " + displayName + " to " + payload.displayName + "?";

            // TODO front-end validation
            serverActionWrapper(null, promptNextModalConfig);

          }else{

            let promptNextModalConfig = {
              modalHeaderNode: document.createElement("p"),
              modalContentNode: document.createElement("p"),
              nextActionHandler: async function() {
                let isSuccess = await addDespository(payload);
                if(isSuccess) {
                  skeletonMod.loadFunctionContent(await getInitializedContentNode("depo"));
                }
                return isSuccess;
              }
            };
            promptNextModalConfig.modalHeaderNode.textContent = "New Depository";
            promptNextModalConfig.modalContentNode.textContent = "Add a new depository: " + payload.displayName + "?";

            // TODO front-end validation
            serverActionWrapper(null, promptNextModalConfig);

          }

        });
        let cancelBtn = node.querySelector("[name=cancelBtn]");
        cancelBtn.addEventListener("click", function() {
          configUi.depoList.replaceChild(lastRepresentation, nodeRepresentation);
          nodeRepresentation = lastRepresentation;
          depoItem.present();
        });
        configUi.depoList.replaceChild(node, nodeRepresentation);
        nodeRepresentation = node;
        depoItem.present();
        displayNameText.focus();
      },
      switchToRead: function() {
        let node = configUi.depoItemTmpl_Read_.cloneNode(true);
        node.setAttribute("id", depoId ? depoId : "addDepo");
        let displayNameText = node.querySelector("[name=displayName]");
        displayNameText.textContent = displayName ? displayName : "";
        let editBtn = node.querySelector("[name=editBtn]");
        editBtn.addEventListener("click", function() {
          depoItem.switchToEdit();
          depoItem.present();
        });
        let deleteBtn = node.querySelector("[name=deleteBtn]");
        deleteBtn.addEventListener("click", function() {
          let payload = {
            ownerId: "trista167@gmail.com", // TODO remove hardcode
            depoId: depoId
          };

          let promptNextModalConfig = {
            modalHeaderNode: document.createElement("p"),
            modalContentNode: document.createElement("p"),
            nextActionHandler: async function() {
              let isSuccess = await deleteDepository(payload);
              if(isSuccess) {
                skeletonMod.loadFunctionContent(await getInitializedContentNode("depo"));
              }
              return isSuccess;
            }
          };
          promptNextModalConfig.modalHeaderNode.textContent = "Confirm Delete";
          promptNextModalConfig.modalContentNode.innerHTML = "Delete depository: " + displayName + "?<br> Warning: records under this depository will be deleted as well!";

          // TODO front-end validation
          serverActionWrapper(null, promptNextModalConfig);

        });
        nodeRepresentation = node;
        depoItem.present();
      },
      switchToEmpty: function() {
        let node = configUi.depoItem_Add.cloneNode(true);
        let addBtn = node.querySelector("[name=addBtn]");
        addBtn.addEventListener("click", this.switchToEdit);
        nodeRepresentation = node;
      },
      present: function() {
        nodeRepresentation.style.display = "block";
        return nodeRepresentation;
      }

    };
    if(state == "empty") {
      depoItem.switchToEmpty();
    }else if(state == "read") {
      depoItem.switchToRead();
    };
    return depoItem;
  };

  async function addDespository(payload) {
    return await commonCUDActionWrapper("/config/addDepo", payload);
  };

  async function deleteDepository(payload) {
    return await commonCUDActionWrapper("/config/deletDepo", payload);
  };

  async function updateDespository(payload) {
    return await commonCUDActionWrapper("/config/editDepo", payload);
  }

  function buildMngAccItem(state, mngAccId, displayName) {

    // state value range: [empty, edit, read]
    let nodeRepresentation = null;
    let lastRepresentation = null;
    let mngAccItem = null;

    mngAccItem = {

      switchToEdit: function() {
        lastRepresentation = nodeRepresentation;
        let node = configUi.mngAccItemTmpl_Edit_.cloneNode(true);
        node.setAttribute("id", mngAccId ? mngAccId : "addMngAcc");
        let displayNameText = node.querySelector("[name=displayName]");
        displayNameText.value = displayName ? displayName : "";
        let confirmBtn = node.querySelector("[name=confirmBtn]");
        confirmBtn.addEventListener("click", function() {

          let payload = {
            ownerId: "trista167@gmail.com", // TODO remove hardcode
            displayName: displayNameText.value
          }
          if(mngAccId && mngAccId.length > 0) {

            payload.mngAccId = mngAccId;

            let promptNextModalConfig = {
              modalHeaderNode: document.createElement("p"),
              modalContentNode: document.createElement("p"),
              nextActionHandler: async function() {
                let isSuccess = await updateMngAcc(payload);
                if(isSuccess) {
                  skeletonMod.loadFunctionContent(await getInitializedContentNode("mngAcc"));
                }
                return isSuccess;
              }
            };
            promptNextModalConfig.modalHeaderNode.textContent = "Update Managing Account";
            promptNextModalConfig.modalContentNode.textContent = "Update depository name from " + displayName + " to " + payload.displayName + "?";

            // TODO front-end validation
            serverActionWrapper(null, promptNextModalConfig);

          }else{

            let promptNextModalConfig = {
              modalHeaderNode: document.createElement("p"),
              modalContentNode: document.createElement("p"),
              nextActionHandler: async function() {
                let isSuccess = await addMngAcc(payload);
                if(isSuccess) {
                  skeletonMod.loadFunctionContent(await getInitializedContentNode("mngAcc"));
                }
                return isSuccess;
              }
            };
            promptNextModalConfig.modalHeaderNode.textContent = "New Managing Account";
            promptNextModalConfig.modalContentNode.textContent = "Add a new managing account: " + payload.displayName + "?";

            // TODO front-end validation
            serverActionWrapper(null, promptNextModalConfig);

          }

        });
        let cancelBtn = node.querySelector("[name=cancelBtn]");
        cancelBtn.addEventListener("click", function() {
          configUi.mngAccList.replaceChild(lastRepresentation, nodeRepresentation);
          nodeRepresentation = lastRepresentation;
          mngAccItem.present();
        });
        configUi.mngAccList.replaceChild(node, nodeRepresentation);
        nodeRepresentation = node;
        mngAccItem.present();
        displayNameText.focus();
      },
      switchToRead: function() {
        let node = configUi.mngAccItemTmpl_Read_.cloneNode(true);
        node.setAttribute("id", mngAccId ? mngAccId : "addMngAcc");
        let displayNameText = node.querySelector("[name=displayName]");
        displayNameText.textContent = displayName ? displayName : "";
        let editBtn = node.querySelector("[name=editBtn]");
        editBtn.addEventListener("click", function() {
          mngAccItem.switchToEdit();
          mngAccItem.present();
        });
        let deleteBtn = node.querySelector("[name=deleteBtn]");
        deleteBtn.addEventListener("click", function() {
          let payload = {
            ownerId: "trista167@gmail.com", // TODO remove hardcode
            mngAccId: mngAccId
          };

          let promptNextModalConfig = {
            modalHeaderNode: document.createElement("p"),
            modalContentNode: document.createElement("p"),
            nextActionHandler: async function() {
              let isSuccess = await deleteMngAcc(payload);
              if(isSuccess) {
                skeletonMod.loadFunctionContent(await getInitializedContentNode("mngAcc"));
              }
              return isSuccess;
            }
          };
          promptNextModalConfig.modalHeaderNode.textContent = "Confirm Delete";
          promptNextModalConfig.modalContentNode.innerHTML = "Delete Managing Account: " + displayName + "?<br> Warning: records under this managing account will be orphan records!";

          // TODO front-end validation
          serverActionWrapper(null, promptNextModalConfig);

        });
        nodeRepresentation = node;
        mngAccItem.present();
      },
      switchToEmpty: function() {
        let node = configUi.mngAccItem_Add.cloneNode(true);
        let addBtn = node.querySelector("[name=addBtn]");
        addBtn.addEventListener("click", this.switchToEdit);
        nodeRepresentation = node;
      },
      present: function() {
        nodeRepresentation.style.display = "block";
        return nodeRepresentation;
      }

    };
    if(state == "empty") {
      mngAccItem.switchToEmpty();
    }else if(state == "read") {
      mngAccItem.switchToRead();
    };
    return mngAccItem;
  };

  function buildComboItem(state, depoId, mngAccId, amount) {

    // state value range: [empty, edit, read]
    let nodeRepresentation = null;
    let lastRepresentation = null;
    let comboItem = null;

    comboItem = {

      switchToEdit: function(mode) {

        lastRepresentation = nodeRepresentation;
        let node;
        let depoSelect;
        let mngAccSelect;
        if(mode == "new") {
          node = configUi.comboItemTmpl_InitEdit_.cloneNode(true);
          depoSelect = node.querySelector("[name=depoSelect]");
          depoSelect.innerHTML = "";
          serverData.depos.forEach((depo) => {
            let opt = document.createElement("option");
            opt.textContent = depo.displayName;
            opt.value = depo.id;
            depoSelect.appendChild(opt);
            if(depoId && depoId == opt.value) {
              opt.setAttribute("selected", true);
            }
          });
          mngAccSelect = node.querySelector("[name=mngAccSelect]");
          mngAccSelect.innerHTML = "";
          serverData.mngAccs.forEach((mngAcc) => {
            let opt = document.createElement("option");
            opt.textContent = mngAcc.displayName;
            opt.value = mngAcc.id;
            mngAccSelect.appendChild(opt);
            if(mngAccId && mngAccId == opt.value) {
              opt.setAttribute("selected", true);
            }
          });
        }else{
          node = configUi.comboItemTmpl_Edit_.cloneNode(true);
          let depoDisplayName = node.querySelector("[name=depoDisplayName]");
          depoDisplayName.textContent = getDepoDisplayName(depoId);
          let mngAccDisplayName = node.querySelector("[name=mngAccDisplayName]");
          mngAccDisplayName.textContent = getMngAccDisplayName(mngAccId);
        }
        node.setAttribute("id", depoId + "_" + mngAccId);
        let initAmount = node.querySelector("[name=initAmount]");
        initAmount.value = amount ? amount : 0;
        let confirmBtn = node.querySelector("[name=confirmBtn]");
        confirmBtn.addEventListener("click", function() {

          let payload = {
            ownerId: "trista167@gmail.com", // TODO remove hardcode
            depoId: depoId,
            mngAccId: mngAccId,
            initAmount: initAmount.value
          };
          if(mode == "new") {

            payload.depoId = depoSelect.value;
            payload.mngAccId = mngAccSelect.value;

            let promptNextModalConfig = {
              modalHeaderNode: document.createElement("p"),
              modalContentNode: document.createElement("p"),
              nextActionHandler: async function() {
                let isSuccess = await insertOrUpdateInitCombo(payload);
                if(isSuccess) {
                  skeletonMod.loadFunctionContent(await getInitializedContentNode());
                }
                return isSuccess;
              }
            };
            promptNextModalConfig.modalHeaderNode.textContent = "Initialize Combination";
            promptNextModalConfig.modalContentNode.textContent = "Add a new combination of " + getDepoDisplayName(payload.depoId) + " - " + getMngAccDisplayName(payload.mngAccId) + " with initial amount " + payload.initAmount + "?";

            // TODO front-end validation
            serverActionWrapper(null, promptNextModalConfig);

          }else{

            let promptNextModalConfig = {
              modalHeaderNode: document.createElement("p"),
              modalContentNode: document.createElement("p"),
              nextActionHandler: async function() {
                let isSuccess = await insertOrUpdateInitCombo(payload);
                if(isSuccess) {
                  skeletonMod.loadFunctionContent(await getInitializedContentNode());
                }
                return isSuccess;
              }
            };
            promptNextModalConfig.modalHeaderNode.textContent = "Update Combination";
            promptNextModalConfig.modalContentNode.textContent = "Change initial amount of " + getDepoDisplayName(payload.depoId) + " - " + getMngAccDisplayName(payload.mngAccId) + " to " + payload.initAmount + " from now? If you do so, records before this moment will not be calculated.";

            // TODO front-end validation
            serverActionWrapper(null, promptNextModalConfig);

          }

        });
        let cancelBtn = node.querySelector("[name=cancelBtn]");
        cancelBtn.addEventListener("click", function() {
          configUi.comboList.replaceChild(lastRepresentation, nodeRepresentation);
          nodeRepresentation = lastRepresentation;
          comboItem.present();
        });
        configUi.comboList.replaceChild(node, nodeRepresentation);
        nodeRepresentation = node;
        comboItem.present();

      },
      switchToRead: function() {

        let node = configUi.comboItemTmpl_Read_.cloneNode(true);
        node.setAttribute("id", depoId + "_" + mngAccId);
        let depoDisplayName = node.querySelector("[name=depoDisplayName]");
        depoDisplayName.textContent = getDepoDisplayName(depoId);
        let mngAccDisplayName = node.querySelector("[name=mngAccDisplayName]");
        mngAccDisplayName.textContent = getMngAccDisplayName(mngAccId);
        let initAmount = node.querySelector("[name=initAmount]");
        initAmount.textContent = "Initial Amount: " + amount;
        let editBtn = node.querySelector("[name=editBtn]");
        editBtn.addEventListener("click", function() {
          comboItem.switchToEdit();
          comboItem.present();
        });
        let deleteBtn = node.querySelector("[name=deleteBtn]");
        deleteBtn.addEventListener("click", function() {

          let payload = {
            ownerId: "trista167@gmail.com", // TODO remove hardcode
            depoId: depoId,
            mngAccId: mngAccId
          };
          let promptNextModalConfig = {
            modalHeaderNode: document.createElement("p"),
            modalContentNode: document.createElement("p"),
            nextActionHandler: async function() {
              let isSuccess = await deleteInitializedCombo(payload);
              if(isSuccess) {
                skeletonMod.loadFunctionContent(await getInitializedContentNode());
              }
              return isSuccess;
            }
          };
          promptNextModalConfig.modalHeaderNode.textContent = "Delete Combination";
          promptNextModalConfig.modalContentNode.textContent = "Delete combination of " + getDepoDisplayName(payload.depoId) + " - " + getMngAccDisplayName(payload.mngAccId) + "? The records under this combo will be orphan records.";

          // TODO front-end validation
          serverActionWrapper(null, promptNextModalConfig);

        });
        nodeRepresentation = node;
        comboItem.present();

      },
      switchToEmpty: function() {
        let node = configUi.comboItem_Add.cloneNode(true);
        let addBtn = node.querySelector("[name=addBtn]");
        addBtn.addEventListener("click", function() {
          comboItem.switchToEdit("new");
        });
        nodeRepresentation = node;
      },
      present: function() {
        nodeRepresentation.style.display = "block";
        return nodeRepresentation;
      }

    };
    if(state == "empty") {
      comboItem.switchToEmpty();
    }else if(state == "read") {
      comboItem.switchToRead();
    };
    return comboItem;

  };

  async function addMngAcc(payload) {
    return await commonCUDActionWrapper("/config/addMngAcc", payload);
  }

  async function updateMngAcc(payload) {
    return await commonCUDActionWrapper("/config/editMngAcc", payload);
  };

  async function deleteMngAcc(payload) {
    return await commonCUDActionWrapper("/config/deleteMngAcc", payload);
  };

  async function insertOrUpdateInitCombo(payload) {
    return await commonCUDActionWrapper("/config/initializeDepoMngAcc", payload);
  };

  async function deleteInitializedCombo(payload) {
    return await commonCUDActionWrapper("/config/deleteInitializedCombo", payload);
  };

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

  function toggleOneListAtATime() {
    let listIds = ["depoList", "mngAccList", "comboList"];
    let currentMatchingList = configUi[this.id.replace("Toggle", "")];
    currentMatchingList.style.display = "block"; // there must be an open list, so the close behavior of current list will be trigger by the open behavior of other lists
    listIds.filter((listId) => {
      return listId != currentMatchingList.id;
    }).forEach((listId) => {
      configUi[listId].style.display = currentMatchingList.style.display == "none" ? "block" : "none";
    });
  };

  async function getInitializedContentNode(mode) {

    refreshconfigUi();
    await refreshServerData();

    // List depos
    configUi.depoList.innerHTML = "";
    configUi.depoListToggle.addEventListener("click", toggleOneListAtATime);
    serverData.depos.forEach((depo) => {
      let depoItem = buildDepoItem("read", depo.id, depo.displayName);
      configUi.depoList.appendChild(depoItem.present());
    });
    let defaultAddDepo = buildDepoItem("empty", null, null);
    configUi.depoList.appendChild(defaultAddDepo.present());

    // List mngAcc
    configUi.mngAccList.innerHTML = "";
    configUi.mngAccListToggle.addEventListener("click", toggleOneListAtATime);
    serverData.mngAccs.forEach((mngAcc) => {
      let mngAccItem = buildMngAccItem("read", mngAcc.id, mngAcc.displayName);
      configUi.mngAccList.appendChild(mngAccItem.present());
    });
    let defaultAddMngAcc = buildMngAccItem("empty", null, null);
    configUi.mngAccList.appendChild(defaultAddMngAcc.present());

    // List combos
    configUi.comboList.innerHTML = "";
    configUi.comboListToggle.addEventListener("click", toggleOneListAtATime);
    serverData.initializedCombo.forEach((combo) => {
      let comboItem = buildComboItem("read", combo.depoId, combo.mngAccId, combo.initValue);
      configUi.comboList.appendChild(comboItem.present());
    });
    let defaultAddCombo = buildComboItem("empty", null, null, null);
    configUi.comboList.appendChild(defaultAddCombo.present());

    if(mode == "depo") {
      configUi.depoListToggle.click();
    }else if(mode == "mngAcc") {
      configUi.mngAccListToggle.click();
    }else{
      configUi.comboListToggle.click();
    }

    return configUi.contentNode;
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
