define(function() {

  return {
    getDateIptStr: function(dateObj) {
      var year = dateObj.getFullYear();
      var month = (parseInt(dateObj.getMonth()) + 1).toString();
      var date = dateObj.getDate();
      var dateStr = year + "-" + (month.length == 1 ? "0" + month : month) + "-" + date;
      return dateStr;
    },
    ajaxPost: async function(url, payload) {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
          if(xhr.status === 200) {
            console.log(xhr.responseText);
            resolve(JSON.parse(xhr.responseText));
          }else{
            reject(xhr.status);
          }
        };
        xhr.send(JSON.stringify(payload));
      });
    }
  }

});
