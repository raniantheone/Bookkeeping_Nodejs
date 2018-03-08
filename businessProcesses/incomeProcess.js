var datastoreSvc = require("../services/datastoreService");

exports.ownerIdExists = async function(ownerId) {
  var itExists = false;
  try {
    var user = await datastoreSvc.queryExistingUser(ownerId);
    itExists = (user != null && user.ownerId == ownerId);
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  console.log("%s exists in the system? %s", ownerId, itExists);
  return itExists;
}

exports.getInitDepoMngAccPrefAndMapping = async function(ownerId) {
  var groupedData = {
    depos: [],
    mngAccs: [],
    initialized: [],
    userPref: {}
  };
  try {
    var depoMngAccWithInitValue = datastoreSvc.queryDepoMngAccWithInitValue(ownerId);
    var user = datastoreSvc.queryExistingUser(ownerId);
    await Promise.all([depoMngAccWithInitValue, user]).then((resolvedArr) => {

      var depoMngAccWithInitValueArr = resolvedArr[0];
      depoMngAccWithInitValueArr.forEach((entry) => {
        if(entry.type == "depo") {
          groupedData.depos.push(entry);
        }else if(entry.type == "mngAcc") {
          groupedData.mngAccs.push(entry);
        }else if(entry.type == "income") {
          groupedData.initialized.push(entry);
        }
      });

      groupedData.userPref = resolvedArr[1].prefs;

    });
  } catch(err) {
    console.log(err + " <-- err happend; process layer consumes it and returns default value");
  }
  return groupedData;
}
