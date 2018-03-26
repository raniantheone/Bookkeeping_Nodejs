define(["../clientUtil", "../skeleton", "text!../../functionSnippet/distribution.html", "d3"], function(clientUtil, skeletonMod, distributionHtml, d3) {

  let displayName = "test distribution client mod";

  let distroUi = {
    contentNode: null,
    assestsTotal: null,
    byDepoToggle: null,
    distroAreaByDepo: null,
    depoSubRow_templ: null,
    depoSubRowItemsList_templ: null,
    mngAccItemRow_tmpl: null,
    byMngAccToggle: null,
    distroAreaByMngAcc: null,
    mngAccSubRow_templ: null,
    mngAccSubRowItemsList_templ: null,
    depoItemRow_tmpl: null
  };

  let serverData = {
    depos: [],
    mngAccs: [],
    balanceEntries: []
  };

  function refreshdistroUi() {
    distroUi.contentNode = new DOMParser().parseFromString(distributionHtml, "text/html").getElementById("funcDistribution");
    distroUi.assestsTotal = distroUi.contentNode.querySelector("#assestsTotal");
    distroUi.byDepoToggle = distroUi.contentNode.querySelector("#byDepoToggle");
    distroUi.distroAreaByDepo = distroUi.contentNode.querySelector("#distroAreaByDepo");
    distroUi.depoSubRow_templ = distroUi.contentNode.querySelector("#depoSubRow_templ");
    distroUi.depoSubRowItemsList_templ = distroUi.contentNode.querySelector("#depoSubRowItemsList_templ");
    distroUi.mngAccItemRow_tmpl = distroUi.contentNode.querySelector("#mngAccItemRow_tmpl");
    distroUi.byMngAccToggle = distroUi.contentNode.querySelector("#byMngAccToggle");
    distroUi.distroAreaByMngAcc = distroUi.contentNode.querySelector("#distroAreaByMngAcc");
    distroUi.mngAccSubRow_templ = distroUi.contentNode.querySelector("#mngAccSubRow_templ");
    distroUi.mngAccSubRowItemsList_templ = distroUi.contentNode.querySelector("#mngAccSubRowItemsList_templ");
    distroUi.depoItemRow_tmpl = distroUi.contentNode.querySelector("#depoItemRow_tmpl");
  }

  async function refreshServerData() {
    try {
      let res = await clientUtil.ajaxPost("/analysis/balanceDistribution", {	ownerId: "trista167@gmail.com"}); // TODO remove hardcode
      if(res.isSuccess) {
        serverData.depos = res.payload.depos;
        serverData.mngAccs = res.payload.mngAccs;
        serverData.balanceEntries = res.payload.balanceEntries;
      }else{
        console.log(res.error);
      };
    } catch(err) {
      console.log(err);
    };
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

  function buildDepoDistro(depoId, displayName, balance, mngAccs, circleResArr) {
    let depoDistro = {
      id: depoId,
      name: displayName,
      subSum: balance,
      subMngAccs: mngAccs,
      depoNodeRepresentation: null,
      listNodeRepresentation: null,
    };
    depoDistro.depoNodeRepresentation = distroUi.depoSubRow_templ.cloneNode(true);
    depoDistro.depoNodeRepresentation.setAttribute("id", "depoSubRow_" + depoDistro.id);
    depoDistro.depoNodeRepresentation.querySelector("[name=depoSubName]").textContent = depoDistro.name;
    depoDistro.depoNodeRepresentation.querySelector("[name=depoSubSumAmount]").textContent = depoDistro.subSum;
    depoDistro.depoNodeRepresentation.style.borderLeftColor = circleResArr.filter((circleRes) => {
      return circleRes.id == depoDistro.id;
    }).map((matchedRes) => {
      return matchedRes.color;
    })[0];
    depoDistro.listNodeRepresentation = distroUi.depoSubRowItemsList_templ.cloneNode();
    depoDistro.listNodeRepresentation.setAttribute("id", "depoSubRowItemsList_" + depoDistro.id);
    depoDistro.subMngAccs.forEach((mngAcc) => {
      let mngAccItemRow = distroUi.mngAccItemRow_tmpl.cloneNode(true);
      mngAccItemRow.setAttribute("id", "mngAccItemRow_" + mngAcc.id);
      mngAccItemRow.querySelector("[name=mngAccItemName]").textContent = mngAcc.name;
      mngAccItemRow.querySelector("[name=mngAccItemAmount]").textContent = mngAcc.balance;
      depoDistro.listNodeRepresentation.appendChild(mngAccItemRow);
    });
    depoDistro.depoNodeRepresentation.addEventListener("click", function() {
      depoDistro.listNodeRepresentation.style.display = depoDistro.listNodeRepresentation.style.display == "none" ? "block" : "none";
    });
    return depoDistro;
  };

  function buildMngAccDistro(mngAccId, displayName, balance, depos, circleResArr) {
    let mngAccDistro = {
      id: mngAccId,
      name: displayName,
      subSum: balance,
      subdepos: depos,
      mngAccNodeRepresentation: null,
      listNodeRepresentation: null,
    };
    mngAccDistro.mngAccNodeRepresentation = distroUi.mngAccSubRow_templ.cloneNode(true);
    mngAccDistro.mngAccNodeRepresentation.setAttribute("id", "mngAccSubRow_" + mngAccDistro.id);
    mngAccDistro.mngAccNodeRepresentation.querySelector("[name=mngAccSubName]").textContent = mngAccDistro.name;
    mngAccDistro.mngAccNodeRepresentation.querySelector("[name=mngAccSubSumAmount]").textContent = mngAccDistro.subSum;
    mngAccDistro.mngAccNodeRepresentation.style.borderLeftColor = circleResArr.filter((circleRes) => {
      return circleRes.id == mngAccDistro.id;
    }).map((matchedRes) => {
      return matchedRes.color;
    })[0];
    mngAccDistro.listNodeRepresentation = distroUi.mngAccSubRowItemsList_templ.cloneNode();
    mngAccDistro.listNodeRepresentation.setAttribute("id", "mngAccSubRowItemsList_" + mngAccDistro.id);
    mngAccDistro.subdepos.forEach((depo) => {
      let depoItemRow = distroUi.depoItemRow_tmpl.cloneNode(true);
      depoItemRow.setAttribute("id", "depoItemRow_" + depo.id);
      depoItemRow.querySelector("[name=depoItemName]").textContent = depo.name;
      depoItemRow.querySelector("[name=depoItemAmount]").textContent = depo.balance;
      mngAccDistro.listNodeRepresentation.appendChild(depoItemRow);
    });
    mngAccDistro.mngAccNodeRepresentation.addEventListener("click", function() {
      mngAccDistro.listNodeRepresentation.style.display = mngAccDistro.listNodeRepresentation.style.display == "none" ? "block" : "none";
    });
    return mngAccDistro;
  };

  function drawDepoDistroChart(data) {

    let circleResArr = drawPieChart(data, "distroPieChartByDepo");
    let hiddenGraph = document.getElementById("distroPieChartByDepo");
    distroUi.distroAreaByDepo.appendChild(hiddenGraph);
    distroUi.distroAreaByDepo.querySelector("#distroPieChartByDepo").style.display = "block";
    return circleResArr;

  };

  function drawMngAccDistroChart(data) {

    let circleResArr = drawPieChart(data, "distroPieChartByMngAcc");
    let hiddenGraph = document.getElementById("distroPieChartByMngAcc");
    distroUi.distroAreaByMngAcc.appendChild(hiddenGraph);
    distroUi.distroAreaByMngAcc.querySelector("#distroPieChartByMngAcc").style.display = "block";
    return circleResArr;

  };

  function drawPieChart(data, chartId) {

    var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    var color = d3.scaleOrdinal(d3.schemeAccent);

    var r = 50;
    var arc = d3.arc().outerRadius(r).innerRadius(r * 0.6);
    var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.subSum; });

    let circleResArr = [];
    var svg = d3.select("body")
        .append("svg")
          .attr("width", r * 2)
          .attr("height", r * 2)
          .attr("style", "display:none; margin:auto; margin-top:15px; margin-bottom:10px")
          .attr("id", chartId)
        .append("g")
        .attr("transform", "translate(" + r + "," + r + ")")
        .data(data)
          .attr("class", "pie")
        .selectAll(".arc")
        .data(pie(data))
          .enter().append("path")
            .attr("class", "arc")
            .attr("d", arc)
            .style("fill", function(d) {
              let circleRes = {
                id: d.data.id,
                name: d.data.name,
                color: color(d.data.name)
              };
              circleResArr.push(circleRes);
              return circleRes.color;
            });

    console.log(circleResArr);
    return circleResArr;
  };


  async function getInitializedContentNode(mode) {
    refreshdistroUi();
    await refreshServerData();

    let depoDistroDatas = [];
    let uniqueDepoIds = [];
    let mngAccDistroDatas = [];
    let uniqueMngAccIds = [];
    serverData.balanceEntries.forEach((entry) => {
      if(!uniqueDepoIds.includes(entry.depoId)) {
        uniqueDepoIds.push(entry.depoId);
        let depoDistroData = {
          id: entry.depoId,
          name: getDepoDisplayName(entry.depoId),
          subSum: entry.currentBalance,
          subMngAccs: []
        };
        depoDistroData.subMngAccs.push({
          id: entry.mngAccId,
          name: getMngAccDisplayName(entry.mngAccId),
          balance: entry.currentBalance
        });
        depoDistroDatas.push(depoDistroData);
      }else{
        let [currentDepo] = depoDistroDatas.filter((depoData) => { return depoData.id == entry.depoId; });
        currentDepo.subSum += entry.currentBalance;
        currentDepo.subMngAccs.push({
          id: entry.mngAccId,
          name: getMngAccDisplayName(entry.mngAccId),
          balance: entry.currentBalance
        });
      };
      if(!uniqueMngAccIds.includes(entry.mngAccId)) {
        uniqueMngAccIds.push(entry.mngAccId);
        let mngAccDistroData = {
          id: entry.mngAccId,
          name: getMngAccDisplayName(entry.mngAccId),
          subSum: entry.currentBalance,
          subDepos: []
        };
        mngAccDistroData.subDepos.push({
          id: entry.depoId,
          name: getDepoDisplayName(entry.depoId),
          balance: entry.currentBalance
        });
        mngAccDistroDatas.push(mngAccDistroData);
      }else{
        let [currentMngAcc] = mngAccDistroDatas.filter((mngAccData) => { return mngAccData.id == entry.mngAccId; });
        currentMngAcc.subSum += entry.currentBalance;
        currentMngAcc.subDepos.push({
          id: entry.depoId,
          name: getDepoDisplayName(entry.depoId),
          balance: entry.currentBalance
        });
      };
    });

    distroUi.distroAreaByDepo.innerHTML = "";
    distroUi.distroAreaByMngAcc.innerHTML = "";
    let depoCircleResArr = drawDepoDistroChart(depoDistroDatas);
    let mngAccCircleResArr = drawMngAccDistroChart(mngAccDistroDatas);

    depoDistroDatas.forEach((depoDistroData) => {
      let depoDistro = buildDepoDistro(depoDistroData.id, depoDistroData.name, depoDistroData.subSum, depoDistroData.subMngAccs, depoCircleResArr);
      distroUi.distroAreaByDepo.appendChild(depoDistro.depoNodeRepresentation);
      distroUi.distroAreaByDepo.appendChild(depoDistro.listNodeRepresentation);
    });

    mngAccDistroDatas.forEach((mngAccDistroData) => {
      let mngAccDistro = buildMngAccDistro(mngAccDistroData.id, mngAccDistroData.name, mngAccDistroData.subSum, mngAccDistroData.subDepos, mngAccCircleResArr);
      distroUi.distroAreaByMngAcc.appendChild(mngAccDistro.mngAccNodeRepresentation);
      distroUi.distroAreaByMngAcc.appendChild(mngAccDistro.listNodeRepresentation);
    });

    function showOnlyOneDistro(eventTarget) {
      if(eventTarget.getAttribute("id") == "byDepoToggle") {
        distroUi.distroAreaByDepo.style.display = "block";
        distroUi.distroAreaByMngAcc.style.display = "none";
      }else if(eventTarget.getAttribute("id") == "byMngAccToggle") {
        distroUi.distroAreaByDepo.style.display = "none";
        distroUi.distroAreaByMngAcc.style.display = "block";
      }
    };

    distroUi.byDepoToggle.addEventListener("click", function() {
      showOnlyOneDistro(this);
    });

    distroUi.byMngAccToggle.addEventListener("click", function() {
      showOnlyOneDistro(this);
    });

    distroUi.assestsTotal.textContent = serverData.balanceEntries.reduce((accumulator ,entry) => {
      return accumulator += entry.currentBalance;
    }, 0);

    return distroUi.contentNode;
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
