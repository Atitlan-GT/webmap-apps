$(function () {
  getLatestPlanetFromDB();
});

var runningdate;

function getLatestPlanetFromDB() {
  theJson = {
    service: "getLatestPlanet",
  };
  $.ajax({
    url: "https://freshwater.net/freshwater.net/billyz313/ajax.php",
    type: "POST",
    async: true,
    crossDomain: true,
    data: theJson,
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        console.info(data.errMsg);
      } else {
        console.log(data);
        sss = data;
        var theDate = JSON.parse(data)[0][0];

        var ndate = new Date(theDate);
        runningdate = ndate;
        if (isValidDate(ndate)) {
          console.log(ndate);
          var reDate = new Date(ndate.setDate(ndate.getDate() + 1));
          var sdate =
            reDate.getUTCFullYear() +
            "-" +
            ("0" + (reDate.getUTCMonth() + 1)).slice(-2) +
            "-" +
            ("0" + reDate.getUTCDate()).slice(-2);
          console.log("checking: " + sdate);
          getPlanet(sdate, sdate);
        }
        console.log("out of loop");
      }
    });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function getPlanet(from, to) {
  theJson = {
    dateFrom: from,
    dateTo: to,
    layerCount: 2,
    addsimilar: false,
  };
  $.ajax({
    url: "http://3.0websitedesigns.com/planetproxy.aspx", //"https://freshwater.net/freshwater.net/billyz313/searchPlanet.php", //?url + "getPlanetTile",
    type: "GET",
    async: true,
    crossDomain: true,
    data: theJson,
    searchdate: to,
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        console.info(data.errMsg);
      } else {
        try {
          sample = JSON.parse(data)[0];
          var sdate = sample["date"];
          var sid = sample["layerID"];
          var surl = sample["url"];
          if (!(sdate === null) && !(sdate === "null")) {
            console.log("adding: " + sdate + " to db");
            updatePlanetDB(
              "'" + sdate + "'",
              "'" + surl + "'",
              "'" + sid + "'"
            );
          }

          var ndate = new Date(this.searchdate);
          runningdate = ndate;

          if (isValidDate(ndate) && ndate < new Date()) {
            console.log(ndate);
            var reDate = new Date(ndate.setDate(ndate.getDate() + 1));
            var sdate =
              reDate.getUTCFullYear() +
              "-" +
              ("0" + (reDate.getUTCMonth() + 1)).slice(-2) +
              "-" +
              ("0" + reDate.getUTCDate()).slice(-2);
            console.log("checking: " + sdate);
            getPlanet(sdate, sdate);
          } else {
            console.log("not valid");
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    });
}

function updatePlanetDB(date, url, layerID) {
  theJson = {
    service: "updatePlanetData",
    date: date,
    url: url,
    layerID: layerID,
  };
  $.ajax({
    url: "https://freshwater.net/freshwater.net/billyz313/ajax.php",
    type: "POST",
    async: true,
    crossDomain: true,
    data: theJson,
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        console.info(data.errMsg);
      } else {
        console.log(data);
      }
    });
}
