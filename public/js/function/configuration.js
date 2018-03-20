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
        serverData.depos = res.payload.depos;
        serverData.mngAccs = res.payload.mngAccs;
        serverData.initializedCombo = res.payload.initialized;
        throw new Error("Backend Error");
      }else{
        console.log(res.error);
      };
    } catch(err) {
      console.log(err);
    };
  };

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
          console.log("testing");
          // set up modal and open modal
          let payload = {
            ownerId: "trista167@gmail.com", // TODO remove hardcode
            displayName: displayNameText.value
          }
          if(depoId && depoId.length > 0) {
            payload.depoId = depoId;
            let modalHeaderNode = document.createElement("p");
            modalHeaderNode.textContent = "Update Depository";
            let modalContentNode = document.createElement("p");
            modalContentNode.textContent = "Update depository name from " + displayName + " to " + payload.displayName + "?";
            skeletonMod.configureModal(
              modalHeaderNode,
              modalContentNode,
              async function() {
                return skeletonMod.nextActionCUDWrapper(updateDespository, [payload], getInitializedContentNode);
              },
              null
            );
          }else{
            let modalHeaderNode = document.createElement("p");
            modalHeaderNode.textContent = "New Depository";
            let modalContentNode = document.createElement("p");
            modalContentNode.textContent = "Add a new depository: " + payload.displayName + "?";
            skeletonMod.configureModal(
              modalHeaderNode,
              modalContentNode,
              async function() {
                return await addDespository(payload);
              },
              null
            );
          };
          skeletonMod.openModal();
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
          let modalHeaderNode = document.createElement("span");
          modalHeaderNode.textContent = "Confirm Delete";
          let modalContentNode = document.createElement("p");
          modalContentNode.innerHTML = "Delete depository: " + displayName + "?<br> Warning: records under this depository will be deleted as well!";
          skeletonMod.configureModal(
            modalHeaderNode,
            modalContentNode,
            async function() {
              return skeletonMod.nextActionCUDWrapper(deleteDepository, [payload], getInitializedContentNode);
            },
            null
          );
          skeletonMod.openModal();
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
    skeletonMod.showLoadingSpinner();
    let isSuccess = false;
    try {

      let result = await clientUtil.ajaxPost("/config/addDepo", payload);
      skeletonMod.hideLoadingSpinner();

      if(Array.isArray(result.payload)) {
        let modalHeaderNode = document.createElement("span");
        modalHeaderNode.textContent = "Warning";
        let modalContentNode = document.createElement("p");
        modalContentNode.textContent = "Either you're testing the application, or someone is doing some tricky thing with your browser";
        let backendValidErrList = document.createElement("ul");
        result.payload.forEach((validErr) => {
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
      }else if(!result.isSuccess) {
        console.log(result.error);
        throw new Error("Backend Error");
      }else{
        isSuccess = true;
        await skeletonMod.flashSuccessHint();
        skeletonMod.loadFunctionContent(await getInitializedContentNode());
      }

    } catch(error) {
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

  async function deleteDepository(payload) {
    return await clientUtil.ajaxPost("/config/deletDepo", payload);
  };

  async function updateDespository(payload) {
    return await clientUtil.ajaxPost("/config/editDepo", payload);
  }

  async function getInitializedContentNode() {

    refreshconfigUi();
    await refreshServerData();

    // List depos
    configUi.depoList.innerHTML = "";
    configUi.depoListToggle.addEventListener("click", function() {
      configUi.depoList.style.display = configUi.depoList.style.display == "none" ? "block" : "none";
    });
    serverData.depos.forEach((depo) => {
      let depoItem = buildDepoItem("read", depo.id, depo.displayName);
      configUi.depoList.appendChild(depoItem.present());
    });
    let defaultAddDepo = buildDepoItem("empty", null, null);
    configUi.depoList.appendChild(defaultAddDepo.present());

    // List mngAcc

    // List combos

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
