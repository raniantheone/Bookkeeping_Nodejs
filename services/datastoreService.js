var cls = require('cls-hooked');
let logUtil = require("../utils/customLogger");
let logger = logUtil.logger;
let config = require("../config/sysConfig");
let couchbase = require('couchbase');
let cluster = new couchbase.Cluster('couchbase://localhost/');
cluster.authenticate(config.couchbase.bucket.acc, config.couchbase.bucket.pwd);
let bucket = cluster.openBucket(config.couchbase.bucket.name);



exports.queryDepoMngAccAndPreselect = async function(ownerId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `" + config.couchbase.bucket.name + "` WHERE CONTAINS(META(" + config.couchbase.bucket.name + ").id, $1) OR CONTAINS(META(" + config.couchbase.bucket.name + ").id, $2) OR CONTAINS(META(" + config.couchbase.bucket.name + ").id, $3)");
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
    bucket.insert(expenseRecord.id, expenseRecord, (err, result) => {
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
    let queryStr = N1qlQuery.fromString("SELECT prefs FROM `" + config.couchbase.bucket.name + "` WHERE META().id = $1");
    queryStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    let userPref = await new Promise((resolve, reject) => {
      bucket.query(
        queryStr,
        [ownerId + "::user"],
        (err, res) => {
          if (!err) {
            res = res.length == 0 ?
              {}
              : res[0].prefs ?
                res[0].prefs
                : {};
            console.log("Query user pref successfully. Pref is");
            console.log(res);
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

    let updateStr = N1qlQuery.fromString("UPDATE `" + config.couchbase.bucket.name + "` SET prefs = $2 WHERE META().id = $1 RETURNING *;");
    updateStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    let updateResult = await new Promise((resolve, reject) => {
      bucket.query(
        updateStr,
        [ownerId + "::user", userPref],
        (err, res) => {
          if (!err) {
            console.log(res);
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
    let queryStr = N1qlQuery.fromString("SELECT expenseTypes FROM `" + config.couchbase.bucket.name + "` WHERE META().id = 'system::config'");
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
    let queryStr = N1qlQuery.fromString("SELECT * FROM `" + config.couchbase.bucket.name + "` WHERE type = 'depo' AND (ownerId = $1 OR ARRAY_CONTAINS(editorIds, $1) );");
    queryStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    bucket.query(
      queryStr,
      [transIssuer],
      (err, res) => {
        if (!err) {
          res = res.map((entry) => { return entry[config.couchbase.bucket.name] });
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
    let queryStr = N1qlQuery.fromString("SELECT * FROM `" + config.couchbase.bucket.name + "` WHERE type = 'mngAcc' AND (ownerId = $1 OR ARRAY_CONTAINS(editorIds, $1) );");
    queryStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    bucket.query(
      queryStr,
      [transIssuer],
      (err, res) => {
        if (!err) {
          res = res.map((entry) => { return entry[config.couchbase.bucket.name] });
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
  logger.info("queryExistingUser invoked");
  return await new Promise((resolve, reject) => {
    bucket.get(
      ownerId + "::user",
      (err, res) => {
        if (!err) {
          resolve(res);
        }else{
          reject(err);
        }
      }
    );
  }).then((res) => {
    logger.info("Query existing user successfully. User is");
    logger.info(JSON.stringify(res.value));
    return res.value;
  }).catch((err) => {
    if(err.code == config.couchbase.errorCode.noSuchKey) { // {"message":"The key does not exist on the server","code":13}
      console.error("User: %j does not exist", ownerId);
      return null;
    }else{
      console.error("Couldn't query existing user: %j", err);
      throw new Error(err);
    };
  });
}

exports.queryDepoMngAccWithInitValue = async function(ownerId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `" + config.couchbase.bucket.name + "` WHERE ownerId = $1 AND (type = 'mngAcc' OR type = 'depo' OR (type = 'income' AND transType = 'init'));");
    queryStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    bucket.query(
      queryStr,
      [ownerId],
      (err, res) => {
        if (!err) {
          res = res.map((entry) => { return entry[config.couchbase.bucket.name] });
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

// FIXME this does not guarantee the query result is of type mngAcc
exports.queryDepoById = async function(depoId) {
  return new Promise((resolve, reject) => {
    bucket.get(
      depoId,
      (err, res) => {
        if (!err) {
          // FIXME temporary hotfix
          if(res.value.type != "depo") {
            reject("query id supplied is not the id of a depo");
          }else{
            console.log("Query depo successfully. Depo is");
            console.log(res.value);
            resolve(res.value);
          }
        } else {
          if(err.code == config.couchbase.errorCode.noSuchKey) { // {"message":"The key does not exist on the server","code":13}
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
    let queryStr = N1qlQuery.fromString("UPDATE `" + config.couchbase.bucket.name + "` SET displayName = $1 WHERE type = 'depo' AND id = $2 AND ownerId = $3;");
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
    let queryStr = N1qlQuery.fromString("DELETE FROM `" + config.couchbase.bucket.name + "` WHERE ownerId = $1 AND type = 'depo' AND id = $2;");
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

// FIXME this does not guarantee the query result is of type mngAcc
exports.queryMngAccById = async function(mngAccId) {
  return new Promise((resolve, reject) => {
    bucket.get(
      mngAccId,
      (err, res) => {
        if (!err) {
          // FIXME temporary hotfix
          if(res.value.type != "mngAcc") {
            reject("query id supplied is not the id of a mngAcc");
          }else{
            console.log("Query mngAcc successfully. mngAcc is");
            console.log(res.value);
            resolve(res.value);
          }
        } else {
          if(err.code == config.couchbase.errorCode.noSuchKey) { // {"message":"The key does not exist on the server","code":13}
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
    let queryStr = N1qlQuery.fromString("UPDATE `" + config.couchbase.bucket.name + "` SET displayName = $1 WHERE type = 'mngAcc' AND id = $2 AND ownerId = $3 RETURNING *;");
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
    let queryStr = N1qlQuery.fromString("DELETE FROM `" + config.couchbase.bucket.name + "` WHERE ownerId = $1 AND type = 'mngAcc' AND id = $2  RETURNING *;");
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
    let queryStr = N1qlQuery.fromString("DELETE FROM `" + config.couchbase.bucket.name + "` WHERE ownerId = $1 AND type = 'income' AND transType = 'init' AND depo = $2 AND mngAcc = $3  RETURNING *;");
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
        console.log("insert income record successfully. CAS is %j", result.cas);
        resolve(true);
      } else {
        console.error("Couldn't insert income record: %j", err);
        reject(err);
      }
    });
  });
}

exports.querySystemConfig = async function() {
  return new Promise((resolve, reject) => {
    bucket.get(
      "system::config",
      (err, res) => {
        if (!err) {
          console.log("query system config successfully");
          console.log(res.value);
          resolve(res.value);
        } else {
          console.error("Couldn't query system config: %j", err);
          reject(err);
        }
      }
    )
  });
}

exports.queryInitIncomeRecord = async function(ownerId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `" + config.couchbase.bucket.name + "` WHERE ownerId = $1 AND type = 'income' AND transType = 'init';");
    bucket.query(
      queryStr,
      [ownerId],
      (err, res) => {
        if (!err) {
          res = res.map((entry) => {
            return entry[config.couchbase.bucket.name];
          });
          console.log("query init income record successfully");
          console.log(res);
          resolve(res);
        } else {
          console.error("Couldn't query init income record: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryDepoMngAccBalanceParts = async function(depoId, mngAccId, initDateTime) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT type, transType, SUM(transAmount) as total FROM `" + config.couchbase.bucket.name + "` WHERE ((type = 'income' AND transType = 'init') OR (type = 'income' AND transType = 'income' AND transDateTime >= $3) OR (type = 'income' AND transType = 'transfer' AND transDateTime >= $3) OR (type = 'expense' AND transType = 'expense' AND transDateTime >= $3) OR (type = 'expense' AND transType = 'transfer' AND transDateTime >= $3)) AND (depo = $1 AND mngAcc = $2) GROUP BY type, transType;");
    queryStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    bucket.query(
      queryStr,
      [depoId, mngAccId, initDateTime],
      (err, res) => {
        if (!err) {
          console.log("query balance parts of %s - %s after %s successfully", depoId, mngAccId, initDateTime);
          console.log(res);
          resolve(res);
        } else {
          console.error("Couldn't query balance parts: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.deleteDocumentById = async function(documentId) {
  return new Promise((resolve, reject) => {
    bucket.remove(
      documentId,
      (err, res) => {
        if (!err) {
          console.log("delete %s successfully", documentId);
          console.log(res);
          resolve(true);
        } else {
          console.error("Couldn't delete document: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.insertUser = async function(user) {
  return new Promise((resolve, reject) => {
    bucket.insert(
      user.id,
      user,
      (err, res) => {
        if (!err) {
          console.log("insert user %s successfully", user.id);
          console.log(res);
          resolve(true);
        } else {
          console.error("Couldn't insert user: %j", user.id);
          reject(err);
        }
      }
    );
  });
}

exports.queryTransferRecords = async function(ownerId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `" + config.couchbase.bucket.name + "` WHERE ownerId = $1 AND (type = 'income' OR type = 'expense') AND transType = 'transfer';");
    queryStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    bucket.query(
      queryStr
      , [ownerId]
      , (err, res) => {
        if (!err) {
          res = res.map((entry) => { return entry[config.couchbase.bucket.name] });
          console.log("query transfer records of %s successfully", ownerId);
          console.log(res);
          resolve(res);
        } else {
          console.error("Couldn't query transfer records : %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryFlowRecordByOwnerId = async function(ownerId) {
  return new Promise((resolve, reject) => {
    let N1qlQuery = couchbase.N1qlQuery;
    let queryStr = N1qlQuery.fromString("SELECT * FROM `" + config.couchbase.bucket.name + "` WHERE ownerId = $1 AND (type = 'income' OR type = 'expense');");
    queryStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    bucket.query(
      queryStr
      , [ownerId]
      , (err, res) => {
        if (!err) {
          res = res.map((entry) => { return entry[config.couchbase.bucket.name] });
          console.log("query flow records of %s successfully", ownerId);
          console.log(res);
          resolve(res);
        } else {
          console.error("Couldn't query flow records : %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.insertAccessData = async function(accessData) {
  return new Promise((resolve, reject) => {
    bucket.insert(
      accessData.token.toString(),
      accessData,
      { expiry: accessData.maxAge },
      (err, res) => {
        if (!err) {
          console.log("stored document successfully. CAS is %j", res.cas);
          resolve(true);
        } else {
          console.error("Couldn't store document: %j", err);
          reject(err);
        }
      }
    );
  });
}

exports.queryAccessData = async function(accessToken) {
  console.log(accessToken);
  return new Promise((resolve, reject) => {
    bucket.getAndTouch(
      accessToken.toString(),
      config.authenMaxAgeSec,
      (err, res) => {
        if (!err) {
          console.log("Query access data successfully. Data is");
          console.log(res.value);
          resolve(res.value);
        } else {
          if(err.code == config.couchbase.errorCode.noSuchKey) { // {"message":"The key does not exist on the server","code":13}
            resolve(null);
            return;
          }
          console.error("Couldn't query existing user: %j", err);
          reject(err);
        }
      }
    );
  });
};

exports.queryFlowRecord = async function(startTime, endTime, ownerId, issuerId, availDepoIds, availMngAccIds, pagination) {

  let queryResult = {
    flowRecords: [],
    count: 0
  };

  let startTimeClause = "";
  if(startTime) {
    startTimeClause = " AND DATE_DIFF_STR(transDateTime, $1, 'millisecond') >= 0 ";
  };

  let endTimeClause = "";
  if(endTime) {
    endTimeClause = " AND DATE_DIFF_STR(transDateTime, $2, 'millisecond') <= 0 ";
  };

  let ownerIdClause = "";
  if(ownerId) {
    ownerIdClause = " OR ownerId = $3 ";
  };

  let availDepoIdsClause = "";
  if(availDepoIds) {
    availDepoIdsClause = " AND depo IN $5 ";
  };

  let availMngAccIdsClause = "";
  if(availMngAccIds) {
    availMngAccIdsClause = " AND mngAcc IN $6 ";
  };

  let paginationClause = "";
  if(pagination) {
    paginationClause = " OFFSET " + (pagination.page - 1) * pagination.entriesPerPage + " LIMIT " + pagination.entriesPerPage;
  };

  let N1qlQuery = couchbase.N1qlQuery;
  let queryStr = N1qlQuery.fromString("SELECT * FROM `" + config.couchbase.bucket.name + "` WHERE (transIssuer = $4 " + ownerIdClause + ") AND ((type = 'income' OR type = 'expense') AND transType != 'init')" + availDepoIdsClause + availMngAccIdsClause + startTimeClause + endTimeClause + " ORDER BY transDateTime DESC" + paginationClause);
  queryStr.consistency(N1qlQuery.Consistency.REQUEST_PLUS);

  queryResult.flowRecords = await new Promise((resolve, reject) => {
    bucket.query(
      queryStr,
      [startTime, endTime, ownerId, issuerId, availDepoIds, availMngAccIds],
      (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        };
      }
    );
  }).then((res) => {
    res = res.map((entry) => { return entry[config.couchbase.bucket.name] });
    logger.debug(res);
    return res;
  }).catch((err) => {
    logger.error(err);
    throw new Error(err);
  });

  if(pagination.getCount) {
    let queryStr = N1qlQuery.fromString("SELECT COUNT(itemName) AS count FROM `" + config.couchbase.bucket.name + "` WHERE (transIssuer = $4 " + ownerIdClause + ") AND ((type = 'income' OR type = 'expense') AND transType != 'init')" + availDepoIdsClause + availMngAccIdsClause + startTimeClause + endTimeClause);
    queryResult.count = await new Promise((resolve, reject) => {
      bucket.query(
        queryStr,
        [startTime, endTime, ownerId, issuerId, availDepoIds, availMngAccIds],
        (err, res) => {
          if (!err) {
            resolve(res);
          } else {
            reject(err);
          };
        }
      );
    }).then((res) => {
      logger.debug(res);
      return res[0].count;
    }).catch((err) => {
      logger.error(err);
      throw new Error(err);
    });
  };

  return queryResult;

};
