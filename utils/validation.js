exports.createGuard = function(validationRule, successMsg, failMsg, ...valsToBeValidated) {
  let guard = {
    guardPromise: null,
    isValid: null,
    resultMsg: null
  };
  guard.guardPromise = Promise.resolve(validationRule.apply(null, valsToBeValidated));
  guard.guardPromise.then((res) => {
    guard.isValid = res;
    guard.resultMsg = guard.isValid ? successMsg : failMsg;
  }).catch((err) => { console.log(err) });
  console.log(guard);
  return guard;
}

exports.asyncGuardsCheck = async function(guards) {
  var checkResult = {
    allValidated: false,
    allGuards: guards
  };
  return Promise.all(guards.map(
    (guard) => { return guard.guardPromise; })
  ).then(() => {
    checkResult.allValidated = guards.reduce((accumulator, guard) => {
      return accumulator && guard.isValid
    }, true);
    return checkResult;
  }).catch((err) => { console.log(err) });
}

function isEmpty(inputStr) {
  console.log("isEmpty : " + inputStr);
  return inputStr === null || inputStr === undefined || inputStr.length === 0;
}
exports.isEmpty = isEmpty;

exports.isNotEmpty = function(inputStr) {
  console.log("isNotEmpty : " + inputStr);
  return !isEmpty(inputStr);
}

exports.isNumGreaterThanZero = function(inputNum) {
  console.log("isNumGreaterThanZero : " + inputNum);
  return !isNaN(inputNum) && inputNum > 0;
}

exports.isDate = function(dateStr) {
  console.log("isDate : " + dateStr);
  return !isNaN(Date.parse(dateStr));
}

// validSet is an array of unique valid values
exports.isWithinValSet = function(inputVal, validSet) {
  console.log("isWithinValSet : " + inputVal);
  console.log(validSet);
  return validSet.includes(inputVal);
}
