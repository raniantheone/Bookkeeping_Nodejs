// provided by Couchbase
function mockDbQuery(queryKey, callback) {
  setTimeout(function() {
    queryKey = "queried by: " + queryKey;
    console.log(queryKey);
    callback(queryKey);
  }, 2000);
}

function wrapper(queryKey) {
  mockDbQuery(queryKey, function() {
    console.log("in wrapper now");
    it.next(queryKey);
  })
}

function *generator(queryKey) {
  var queryResult = yield wrapper(queryKey);
  return queryResult + " ... from generator";
}

var it = generator("Ranian");
var testObj = it.next();
console.log(testObj);

// function makeAjaxCall(url, callback) {
//   setTimeout(() => { let testObj = { test: url }; callback(testObj); }, 3000);
// }
//
// function request(url) {
//     // this is where we're hiding the asynchronicity,
//     // away from the main code of our generator
//     // `it.next(..)` is the generator's iterator-resume
//     // call
//     makeAjaxCall( url, function(response){
//       response = JSON.stringify(response);
//       console.log(response);
//       it.next( response );
//     } );
//     // Note: nothing returned here!
// }
//
// function *main() {
//     var result1 = yield request( "http://some.url.1" );
//     var data = JSON.parse( result1 );
//
//     var result2 = yield request( "http://some.url.2?id=" + data.id );
//     var resp = JSON.parse( result2 );
//     console.log( "The value you asked for: " + resp.value );
// }
//
// var it = main();
// it.next(); // get it all started
