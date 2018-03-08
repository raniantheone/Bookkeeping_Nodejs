var couchbase = require('couchbase')
var cluster = new couchbase.Cluster('couchbase://localhost/');
cluster.authenticate('Administrator', 'password');
var bucket = cluster.openBucket('bookkeeping');

// console.log(bucket.clientVersion);

// Building User Data
// var userTrista = {
//   type: "user",
//   ownerId: "trista167@gmail.com",
//   password: "password",
//   authType: "email",
//   displayName: "Trista",
//   registeredDateTime: new Date()
// };
// var userRanian = {
//   type: "user",
//   ownerId: "raniantheone@gmail.com",
//   password: "password",
//   authType: "email",
//   displayName: "Ranian",
//   registeredDateTime: new Date()
// };
// bucket.insert("raniantheone@gmail.com::user", userRanian, function(err, result) {
  // if (!err) {
  //   console.log("stored document successfully. CAS is %j", result.cas);
  // } else {
  //   console.error("Couldn't store document: %j", err);
  // }
// });

// Building Depository Data
// function Depository(ownerId, editorIds, viewerIds, displayName) {
//   this.type = "depo";
//   this.ownerId = ownerId;
//   this.editorIds = editorIds;
//   this.viewerIds = viewerIds;
//   this.displayName = displayName;
//   this.name = displayName.replace(/\s/g, "_").replace(/\W/g, "").toLowerCase();
//   let datastoreId = this.ownerId + "::" + this.type + "::" + this.name;
//   this.getDatastoreId = function() {
//     return datastoreId;
//   };
// }
//
// var depositories = [];
// depositories.push(new Depository("trista167@gmail.com", [], [], "Trista's Cash"));
// depositories.push(new Depository("trista167@gmail.com", [], [], "Trista's Cathay Bank"));
// depositories.push(new Depository("trista167@gmail.com", [], [], "Trista's Taiwan Bank"));
// depositories.push(new Depository("trista167@gmail.com", [], [], "Joint Envelop"));
// depositories.push(new Depository("trista167@gmail.com", [], [], "Travel Envelop"));
// depositories.push(new Depository("raniantheone@gmail.com", [], [], "Ranian's Cash"));
//
// depositories.forEach(function(depository) {
//   bucket.insert(depository.getDatastoreId(), depository, function(err, result) {
//     if (!err) {
//       console.log("stored document successfully. CAS is %j", result.cas);
//     } else {
//       console.error("Couldn't store document: %j", err);
//     }
//   });
// });

// Building Managing Account
// {
//   type: string,
//   ownerId: string,
//   editorIds: string,
//   viewerIds: string,
//   displayName: string,
//   name: string
// }
// function ManagingAccount(ownerId, editorIds, viewerIds, displayName) {
//   this.type = "mngAcc";
//   this.ownerId = ownerId;
//   this.editorIds = editorIds;
//   this.viewerIds = viewerIds;
//   this.displayName = displayName;
//   this.name = displayName.replace(/\s/g, "_").replace(/\W/g, "").toLowerCase();
//   let datastoreId = this.ownerId + "::" + this.type + "::" + this.name;
//   this.getDatastoreId = function() {
//     return datastoreId;
//   };
// }
//
// var mngAccs = [];
// mngAccs.push(new ManagingAccount("trista167@gmail.com", [], [], "Joint"));
// mngAccs.push(new ManagingAccount("trista167@gmail.com", [], [], "Travel"));
//
// mngAccs.forEach(function(mngAcc) {
  // bucket.insert(mngAcc.getDatastoreId(), mngAcc, function(err, result) {
  //   if (!err) {
  //     console.log("stored document successfully. CAS is %j", result.cas);
  //   } else {
  //     console.error("Couldn't store document: %j", err);
  //   }
  // });
// });


// Read expense file
// Key: ownerId::type::transDateTime::hash
// {
//   type: string,
//   ownerId: string,
//   editorIds: string,
//   viewerIds: string,
//   itemName: string,
//   itemDesc: string,
//   transAmount: number,
//   transDateTime: datetime,
//   transType: string,
//   transIssuer: string,
//   depo: string,
//   mngAcc: string
// }
// function testHash(str) {
//   var hash = 0, i, chr;
//   if (str.length === 0) return hash;
//   for (i = 0; i < str.length; i++) {
//     chr   = str.charCodeAt(i);
//     hash  = ((hash << 5) - hash) + chr;
//     hash |= 0; // Convert to 32bit integer
//   }
//   return (hash >>> 0);
// };
// function ExpenseRecord(ownerId, editorIds, viewerIds, itemName, itemDesc, transAmount, transDateTime, transType, transIssuer, depo, mngAcc) {
//   this.type = "expense";
//   this.ownerId = ownerId;
//   this.editorIds = editorIds;
//   this.viewerIds = viewerIds;
//   this.itemName = itemName;
//   this.itemDesc = (itemDesc == null || itemDesc == undefined) ? "" : itemDesc;
//   this.transAmount = parseInt(transAmount);
//   this.transDateTime = transDateTime;
//   this.transType = transType;
//   this.transIssuer = transIssuer;
//   this.depo = depo;
//   this.mngAcc = mngAcc;
//   let datastoreId = this.ownerId + "::" + this.type + "::" + this.transDateTime.toISOString().split("T")[0].replace(/-/gi, "") + "::" + testHash(this.itemName + this.itemDesc + this.transAmount + this.depo + this.mngAcc + this.transType);
//   this.getDatastoreId = function() {
//     return datastoreId;
//   }
// };
// var fs = require('fs');
// fs.readFile('Joint Account Bookkeeping - Expense_Data.csv', 'utf8', function(err, contents) {
//     // console.log(contents);
//     var lines = contents.split("\n");
//     // console.log(lines);
//     var expenseRecords = [];
//     lines.forEach(function(line) {
//       var columns = line.split(",");
//       var dateParts = columns[3].split("-");
//       try {
//         expenseRecords.push(new ExpenseRecord(
//           "trista167@gmail.com",
//           [],
//           [],
//           columns[0],
//           columns[1],
//           columns[2],
//           new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])),
//           columns[7] == "transfer" ? "transfer" : "expense",
//           "trista167@gmail.com",
//           "tristas_cash",
//           "joint"
//         ));
//       } catch(error) {
//         console.log(error);
//         console.log(line);
//       }
//     });
//
//     expenseRecords.forEach(function(expRecord, i) {
//       bucket.insert(expRecord.getDatastoreId() + i, expRecord, function(err, result) {
//         if (!err) {
//           console.log("stored document successfully. CAS is %j", result.cas);
//         } else {
//           console.error("Couldn't store document: %j", err);
//         }
//       });
//     });
// });

// var N1qlQuery = couchbase.N1qlQuery;
// bucket.manager().createPrimaryIndex(function() {
//   bucket.upsert('user:king_arthur', {
//     'email': 'kingarthur@couchbase.com', 'interests': ['Holy Grail', 'African Swallows']
//   },
//   function (err, result) {
//     bucket.get('user:king_arthur', function (err, result) {
//       console.log('Got result: %j', result.value);
      // bucket.query(
      // N1qlQuery.fromString('SELECT * FROM bookkeeping WHERE $1 in interests LIMIT 1'),
      // ['African Swallows'],
      // function (err, rows) {
      //   console.log("Got rows: %j", rows);
      // });
//     });
//   });
// });


// select all documents owned by certain user
// SELECT * FROM `bookkeeping` WHERE CONTAINS(META(bookkeeping).id, "raniantheone@gmail.com")

// sum expense after certain date
// SELECT SUM(transAmount) as sumOfFeb FROM `bookkeeping` WHERE ownerId = "trista167@gmail.com" AND type = "expense" AND transType = "expense" AND DATE_DIFF_STR(transDateTime,,"millisecond");

// update document by condition
// UPDATE `bookkeeping`
// SET depo = "joint_envelop"
// WHERE CONTAINS(itemName, "transfer") AND transDateTime = "2018-02-19T16:00:00.000Z" AND transAmount = 200;
