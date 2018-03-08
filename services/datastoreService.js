let couchbase = require('couchbase');
let cluster = new couchbase.Cluster('couchbase://localhost/');
cluster.authenticate('Administrator', 'password');
let bucket = cluster.openBucket('bookkeeping');

let async = require('async');

exports.queryDepoMngAccAndPreselect = async function(ownerId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `bookkeeping` WHERE CONTAINS(META(bookkeeping).id, $1) OR CONTAINS(META(bookkeeping).id, $2) OR CONTAINS(META(bookkeeping).id, $3)");
    bucket.query(
      queryStr,
      [ownerId + "::depo", ownerId + "::mngAcc",  ownerId + "::user"],
      function (err, rows) {
        if(err) {
          reject(err);
        }else{
          console.log("Got rows: %j", rows);
          resolve(rows);
        }
    });
  });
}

exports.insertExpenseRecord = async function(expenseRecord) {
  return new Promise((resolve, reject) => {
    bucket.insert(expenseRecord.getDatastoreId(), expenseRecord, (err, result) => {
      if (!err) {
        console.log("stored document successfully. CAS is %j", result.cas);
        resolve(true);
      } else {
        console.error("Couldn't store document: %j", err);
        reject(err);
      }
    });
  });
}

exports.saveUserPrefs = async function(ownerId, prefs) {

    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT prefs FROM `bookkeeping` WHERE META().id = $1");
    let userPref = await new Promise((resolve, reject) => {
      bucket.query(
        queryStr,
        [ownerId + "::user"],
        (err, res) => {
          if (!err) {
            console.log("Query user pref successfully. Pref is");
            console.log(res);
            res = res.length == 0 ?
              {}
              : res[0].prefs ?
                res[0].prefs
                : {};
            resolve(res);
          } else {
            console.error("Couldn't query user pref: %j", err);
            reject(err);
          }
        }
      );
    });
    prefs.forEach((pref) => {
        let key = Object.keys(pref)[0];
        userPref[key] = pref[key];
    })

    let updateStr = N1qlQuery.fromString("UPDATE `bookkeeping` SET prefs = $2 WHERE META().id = $1");
    let updateResult = await new Promise((resolve, reject) => {
      bucket.query(
        updateStr,
        [ownerId + "::user", userPref],
        (err, res) => {
          if (!err) {
            console.log("Updated document successfully. Update content is");
            console.log(userPref);
            resolve(true);
          } else {
            console.error("Couldn't update document: %j", err);
            reject(err);
          }
        }
      );
    });

    return updateResult;
}

exports.queryExpenseTransTypes = async function() {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT expenseTypes FROM `bookkeeping` WHERE META().id = 'system::config'");
    bucket.query(
      queryStr,
      (err, res) => {
        if (!err) {
          console.log("Query expenseTypes successfully. ExpenseTypes are");
          console.log(res[0].expenseTypes);
          resolve(res[0].expenseTypes);
        } else {
          console.error("Couldn't query expenseTypes: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryAvailableDepos = async function(transIssuer) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `bookkeeping` WHERE type = 'depo' AND (ownerId = $1 OR ARRAY_CONTAINS(editorIds, $1) );");
    bucket.query(
      queryStr,
      [transIssuer],
      (err, res) => {
        if (!err) {
          res = res.map((entry) => { return entry.bookkeeping });
          console.log("Query available depos successfully. Depos are");
          console.log(res);
          resolve(res);
        } else {
          console.error("Couldn't query available depos: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryAvailableMngAccs = async function(transIssuer) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `bookkeeping` WHERE type = 'mngAcc' AND (ownerId = $1 OR ARRAY_CONTAINS(editorIds, $1) );");
    bucket.query(
      queryStr,
      [transIssuer],
      (err, res) => {
        if (!err) {
          res = res.map((entry) => { return entry.bookkeeping });
          console.log("Query available mngAcc successfully. MngAccs are");
          console.log(res);
          resolve(res);
        } else {
          console.error("Couldn't query available mngAcc: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryExistingUser = async function(ownerId) {
  return new Promise((resolve, reject) => {
    bucket.get(
      ownerId + "::user",
      (err, res) => {
        if (!err) {
          console.log("Query existing user successfully. User is");
          console.log(res.value);
          resolve(res.value);
        } else {
          if(err.code == 13) { // {"message":"The key does not exist on the server","code":13}
            resolve(null);
            return;
          }
          console.error("Couldn't query existing user: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryDepoMngAccWithInitValue = async function(ownerId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `bookkeeping` WHERE ownerId = $1 AND (type = 'mngAcc' OR type = 'depo' OR (type = 'income' AND transType = 'init'));");
    bucket.query(
      queryStr,
      [ownerId],
      (err, res) => {
        if (!err) {
          res = res.map((entry) => { return entry.bookkeeping });
          console.log("Query available depo, mngAcc, initValue successfully. Entries are");
          console.log(res);
          resolve(res);
        } else {
          console.error("Couldn't query available depo, mngAcc, initValue: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryDepoById = async function(depoId) {
  return new Promise((resolve, reject) => {
    bucket.get(
      depoId,
      (err, res) => {
        if (!err) {
          console.log("Query depo successfully. Depo is");
          console.log(res.value);
          resolve(res.value);
        } else {
          if(err.code == 13) { // {"message":"The key does not exist on the server","code":13}
            resolve(null);
            return;
          }
          console.error("Couldn't query depo: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.createDepo = async function(depo) {
  return new Promise((resolve, reject) => {
    bucket.insert(
      depo.id,
      depo,
      (err, res) => {
        if (!err) {
          console.log("Create depo successfully.");
          console.log(res);
          resolve(true);
        } else {
          console.error("Couldn't create depo: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.updateDepoName = async function(ownerId, depoId, displayName) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("UPDATE `bookkeeping` SET displayName = $1 WHERE type = 'depo' AND id = $2 AND ownerId = $3;");
    bucket.query(
      queryStr,
      [displayName, depoId, ownerId],
      (err, res) => {
        if (!err) {
          console.log("Update depo successfully.");
          resolve(true);
        } else {
          console.error("Couldn't update depo: %j", err);
          reject(err);
        }
      });
  });
}

exports.delDepo = async function(ownerId, depoId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("DELETE FROM `bookkeeping` WHERE ownerId = $1 AND type = 'depo' AND id = $2;");
    bucket.query(
      queryStr,
      [ownerId, depoId],
      (err, res) => {
        if (!err) {
          console.log("Delete depo successfully.");
          resolve(true);
        } else {
          console.error("Couldn't delete depo: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.createMngAcc = async function(mngAcc) {
  return new Promise((resolve, reject) => {
    bucket.insert(
      mngAcc.id,
      mngAcc,
      (err, res) => {
        if (!err) {
          console.log("Create mngAcc successfully.");
          console.log(res);
          resolve(true);
        } else {
          console.error("Couldn't create mngAcc: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryMngAccById = async function(mngAccId) {
  return new Promise((resolve, reject) => {
    bucket.get(
      mngAccId,
      (err, res) => {
        if (!err) {
          console.log("Query mngAcc successfully. mngAcc is");
          console.log(res.value);
          resolve(res.value);
        } else {
          if(err.code == 13) { // {"message":"The key does not exist on the server","code":13}
            resolve(null);
            return;
          }
          console.error("Couldn't query depo: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.updateMngAccName = async function(ownerId, mngAccId, displayName) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("UPDATE `bookkeeping` SET displayName = $1 WHERE type = 'mngAcc' AND id = $2 AND ownerId = $3 RETURNING *;");
    bucket.query(
      queryStr,
      [displayName, mngAccId, ownerId],
      (err, res) => {
        if (!err) {
          if(res.length == 1) {
            console.log("Update mngAcc successfully.");
            console.log(res);
            resolve(true);
          } else {
            console.log("Couldn't update mngAcc, please verify if input data is valid")
            console.log("ownerId: %s, mngAccId: %s, displayName: %s", ownerId, mngAccId, displayName);
            resolve(false);
          }
        } else {
          console.error("Couldn't update mngAcc: %j", err);
          reject(err);
        }
      });
  });
}

exports.delMngAcc = async function(ownerId, mngAccId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("DELETE FROM `bookkeeping` WHERE ownerId = $1 AND type = 'mngAcc' AND id = $2  RETURNING *;");
    bucket.query(
      queryStr,
      [ownerId, mngAccId],
      (err, res) => {
        if (!err) {
          if(res.length == 1) {
            console.log("Delete following mngAcc successfully.");
            console.log(res);
            resolve(true);
          } else {
            console.log("Couldn't delete mngAcc, please verify if input data is valid")
            console.log("ownerId: %s, mngAccId: %s", ownerId, mngAccId);
            resolve(false);
          }
        } else {
          console.error("Couldn't delete mngAcc: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.deleteInitRecord = async function(ownerId, depoId, mngAccId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("DELETE FROM `bookkeeping` WHERE ownerId = $1 AND type = 'income' AND transType = 'init' AND depo = $2 AND mngAcc = $3  RETURNING *;");
    bucket.query(
      queryStr,
      [ownerId, depoId, mngAccId],
      (err, res) => {
        if (!err) {
          if(res.length == 1) {
            console.log("Delete following init record successfully.");
            console.log(res);
            resolve(true);
          } else {
            console.log("Couldn't delete init record, please verify if input data is valid")
            console.log("ownerId: %s,  depoId: %s, mngAccId: %s", ownerId, depoId, mngAccId);
            resolve(false);
          }
        } else {
          console.error("Couldn't delete init record: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.insertIncomeRecord = async function(incomeRecord) {
  return new Promise((resolve, reject) => {
    bucket.insert(incomeRecord.id, incomeRecord, (err, result) => {
      if (!err) {
        console.log("stored document successfully. CAS is %j", result.cas);
        resolve(true);
      } else {
        console.error("Couldn't store document: %j", err);
        reject(err);
      }
    });
  });
}
