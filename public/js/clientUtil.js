define(function() {

  return {
    getDateIptStr: function(dateObj) {
      var year = dateObj.getFullYear();
      var month = (parseInt(dateObj.getMonth()) + 1).toString();
      var date = dateObj.getDate().toString();
      var dateStr = year + "-" + (month.length == 1 ? "0" + month : month) + "-" + (date.length == 1 ? "0" + date : date);
      return dateStr;
    },
    getDateObjFromDateIpt: function(dateIptValue) {
      let dateParts = dateIptValue.split("-");
      let year = parseInt(dateParts[0]);
      let month = parseInt(dateParts[1]) - 1;
      let date = parseInt(dateParts[2]);
      let dateObj = new Date();
      dateObj.setFullYear(year);
      dateObj.setMonth(month);
      dateObj.setDate(date);
      return dateObj;
    },
    ajaxPost: async function(url, payload) {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
          if(xhr.status === 200) {
            console.log(xhr.responseText);
            if(xhr.responseText.includes("Auth cookie is not valid")) {
              window.location.replace("/bookkeeping/client.html");
              reject("Auth cookie is not valid");
            }else{
              resolve(JSON.parse(xhr.responseText));
            }
          }else{
            reject(xhr.status);
          }
        };
        xhr.send(JSON.stringify(payload));
      });
    },
    createValidator: function(node, validateFunction, errMsg) {
      return {
        node: node,
        validateFunction: validateFunction,
        errMsg: errMsg,
        isValid: false
      }
    },
    validateAll: function(validators) {
      var errValidators = validators.filter((validator) => {
        validator.isValid = validator.validateFunction(validator.node.value);
        return !validator.isValid;
      });
      return {
        errArr: errValidators,
        allPassed: errValidators.length == 0
      }
    }
  }

});
