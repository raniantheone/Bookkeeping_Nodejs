define(["../clientUtil", "../skeleton", "text!../../functionSnippet/records.html"], function(clientUtil, skeletonMod, recordsHtml) {

  let displayName = "Check Records";

  let recordsUi = {
    contentNode: null,
    startDateTime: null,
    endDateTime: null,
    recordsArea: null,
    recordsId_tmpl: null,
    pagingArea: null,
    noRecordsArea: null,
    pageNumsArea: null
  };

  let serverData = {
    flowRecords: [],
    totalCount: 0
  };

  function refreshrecordsUi() {
    recordsUi.contentNode = new DOMParser().parseFromString(recordsHtml, "text/html").getElementById("funcCheckRecords");
    recordsUi.startDateTime = recordsUi.contentNode.querySelector("#startDateTime");
    recordsUi.endDateTime = recordsUi.contentNode.querySelector("#endDateTime");
    recordsUi.recordsArea = recordsUi.contentNode.querySelector("#recordsArea");
    recordsUi.recordsId_tmpl = recordsUi.contentNode.querySelector("#recordsId_tmpl");
    recordsUi.noRecordsArea = recordsUi.contentNode.querySelector("#noRecordsArea");
    recordsUi.pagingArea = recordsUi.contentNode.querySelector("#pagingArea");
    recordsUi.pageNumsArea = recordsUi.contentNode.querySelector("#pageNumsArea");
  }

  async function refreshServerData(payload) {
    try {

      let res = await clientUtil.ajaxPost("/records/checkRecords", payload);
      // TODO check if error
      serverData.flowRecords = res.payload.flowRecords;
      serverData.totalCount = res.payload.count;
    } catch(err) {
      console.log(err);
    };
  };

  function setupQueryDatesIpt() {
    let now = new Date();
    recordsUi.endDateTime.value = clientUtil.getDateIptStr(now);
    recordsUi.startDateTime.value = clientUtil.getDateIptStr(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

    recordsUi.startDateTime.onchange = queryControl.sendNewQuery;
    recordsUi.endDateTime.onchange = queryControl.sendNewQuery;
  };

  function buildRecordItem(flowRecord, tmplNode) {
    let recordItem = {
      transDate: clientUtil.getDateIptStr(new Date(flowRecord.transDateTime)),
      transAmount: flowRecord.transAmount,
      transType: flowRecord.transType,
      depoName: flowRecord.depoName,
      mngAccName: flowRecord.mngAccName,
      itemName: flowRecord.itemName,
      itemDesc: flowRecord.itemDesc,
      issuer: flowRecord.transIssuer,
      nodeRepresentation: tmplNode
    };
    recordItem.nodeRepresentation.querySelector("[name=transDateTime]").textContent = recordItem.transDate;
    recordItem.nodeRepresentation.querySelector("[name=amount]").textContent = recordItem.transAmount;
    recordItem.nodeRepresentation.querySelector("[name=transType]").textContent = recordItem.transType;
    recordItem.nodeRepresentation.querySelector("[name=depo]").textContent = recordItem.depoName;
    recordItem.nodeRepresentation.querySelector("[name=mngAcc]").textContent = recordItem.mngAccName;
    recordItem.nodeRepresentation.querySelector("[name=itemName]").textContent = recordItem.itemName;
    recordItem.nodeRepresentation.querySelector("[name=itemDesc]").textContent = recordItem.itemDesc;
    recordItem.nodeRepresentation.querySelector("[name=issuer]").textContent = recordItem.issuer;
    recordItem.nodeRepresentation.setAttribute("id", flowRecord.id);

    let detailArea = recordItem.nodeRepresentation.querySelector("[name=detailArea]");
    detailArea.style.display = "none";
    recordItem.nodeRepresentation.querySelector("[name=expandToggle]").addEventListener("click", function() {
      detailArea.style.display = detailArea.style.display == "none" ? "block" : "none";
    });
    return recordItem;
  };

  function getStartTimeStr() {
    let dateObj = clientUtil.getDateObjFromDateIpt(recordsUi.startDateTime.value);
    dateObj.setHours(0);
    dateObj.setMinutes(0);
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);
    return dateObj.toISOString();
  };

  function getEndTimeStr() {
    let dateObj = clientUtil.getDateObjFromDateIpt(recordsUi.endDateTime.value);
    dateObj.setHours(23);
    dateObj.setMinutes(59);
    dateObj.setSeconds(59);
    dateObj.setMilliseconds(999);
    return dateObj.toISOString();
  };

  let queryState = {
    queryPayload: null, // only change when query criteria changes, and stays the same if user just move along different pages of the same criteria
    currentPage: null,
    totalPages: null,
    entriesPerPage: null
  };

  let queryControl = {
    queryPayload: null, // only change when query criteria changes, and stays the same if user just move along different pages of the same criteria
    currentPage: null,
    totalPages: null,
    entriesPerPage: null,
    sendNewQuery: async function() {
      let queryPayload = {
        transIssuer: clientUtil.getUserFromCookie(),
        startTime: getStartTimeStr(),
        endTime: getEndTimeStr(),
        page: 1,
        entriesPerPage: 10,
        getCount: true
      }
      await refreshServerData(queryPayload);
      queryState.queryPayload = queryPayload;
      queryState.currentPage = queryPayload.page;
      queryState.totalPages = Math.ceil(serverData.totalCount / queryPayload.entriesPerPage);
      queryState.entriesPerPage = queryPayload.entriesPerPage;
      updateRecordsArea(serverData.flowRecords);
      updatePagingAreaIfNecessary(queryState.currentPage, queryState.totalPages, true); // force refresh pagination
    },
    moveToSpecifiedPage: async function(page) {
      let pageQuery = {};
      for(var prop in queryState.queryPayload) {
        pageQuery[prop] = queryState.queryPayload[prop];
      };
      queryState.currentPage = +page;
      pageQuery.page = +page;
      pageQuery.getCount = false;
      await refreshServerData(pageQuery);
      updateRecordsArea(serverData.flowRecords);
      updatePagingAreaIfNecessary(queryState.currentPage, queryState.totalPages);
    }
  };

  function updateRecordsArea(records) {
    recordsUi.recordsArea.innerHTML = "";
    records.forEach((flowRecord) => {
      let recordItem = buildRecordItem(flowRecord, recordsUi.recordsId_tmpl.cloneNode(true))
      recordsUi.recordsArea.appendChild(recordItem.nodeRepresentation);
    });
  }

  function updatePagingAreaIfNecessary(currentPage, totalPages, forceRefresh = false) {
    let maxBtns = 5;
    let pageBtns = recordsUi.pageNumsArea.childNodes;
    let containsCurrentPage = false;
    for(var i = 0; i < pageBtns.length; i++) {
      if(pageBtns[i].dataset && parseInt(pageBtns[i].dataset.page) == currentPage) {
        containsCurrentPage = true;
        break;
      };
    };
    if(!containsCurrentPage || forceRefresh) {
      recordsUi.pageNumsArea.innerHTML = "";
      let baseNum = (Math.ceil(currentPage / maxBtns) - 1) * maxBtns; // the number of prevBtn
      for(var j = 1; j <= maxBtns; j++) {
        if(baseNum + j > totalPages) {
          break;
        };
        let btn = document.createElement("a");
        btn.setAttribute("class", "w3-button");
        btn.setAttribute("data-page", baseNum + j);
        btn.textContent = baseNum + j;
        btn.addEventListener("click", function() {
          queryControl.moveToSpecifiedPage(this.dataset.page);
        });
        recordsUi.pageNumsArea.appendChild(btn);
      };
      let endNum = baseNum + j; // the number of nextBtn

      let prevBtn = recordsUi.pagingArea.querySelector("[name=previousGroupBtn]");
      if(currentPage > maxBtns) {
        prevBtn.onclick = function() {
          queryControl.moveToSpecifiedPage(baseNum);
        };
        prevBtn.style.display = "block";
      }else{
        prevBtn.style.display = "none";
      };

      let nextBtn = recordsUi.pagingArea.querySelector("[name=nextGroupBtn]");
      if(endNum < totalPages) {
        nextBtn.onclick = function() {
          queryControl.moveToSpecifiedPage(baseNum + maxBtns + 1);
        };
        nextBtn.style.display = "block";
      }else{
        nextBtn.style.display = "none";
      };
    };
    pageBtns.forEach((btn) => {
      if(+btn.dataset.page == currentPage) {
        btn.style.border = "solid 1px";
      }else{
        btn.style.border = "none";
      };
    });
  }

  async function getInitializedContentNode(mode) {
    refreshrecordsUi();
    setupQueryDatesIpt();

    await queryControl.sendNewQuery();

    return recordsUi.contentNode;
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
