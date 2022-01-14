function selectAvailableDates(service) {
  const serviceFunction =
    service === "landsat"
      ? "selectAvailableLandsat"
      : service === "sentinel"
      ? "selectAvailableSentinel"
      : "getAvailablePlanet";

  $.ajax({
    url: "https://freshwater.net/freshwater.net/billyz313/ajax.php",
    type: "POST",
    async: true,
    crossDomain: true,
    data: { service: serviceFunction },
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        console.info(data.errMsg);
      } else {
        if (service === "landsat") {
          available_landsat = JSON.parse(data);
          const sdate = new Date(
            available_landsat[available_landsat.length - 1]
          );
          const rDate = new Date(sdate.setDate(sdate.getDate() + 1));
          getAvailableData(
            "landsat",
            rDate.getUTCFullYear() +
              "-" +
              ("0" + (rDate.getUTCMonth() + 1)).slice(-2) +
              "-" +
              ("0" + rDate.getUTCDate()).slice(-2)
          );
        } else if (service === "sentinel") {
          available_sentinel = JSON.parse(data);
          const sdate = new Date(
            available_sentinel[available_sentinel.length - 1]
          );
          const rDate = new Date(sdate.setDate(sdate.getDate() + 1));
          getAvailableData(
            "sentinel",
            rDate.getUTCFullYear() +
              "-" +
              ("0" + (rDate.getUTCMonth() + 1)).slice(-2) +
              "-" +
              ("0" + rDate.getUTCDate()).slice(-2)
          );
        } else {
          const temp = JSON.parse(data);
          for (let i = 0; i < temp.length; i++) {
            available_planet.push(temp[i][0]);
            pobject[temp[i][0]] = temp[i][1];
          }

          const sdate = new Date(available_planet[available_planet.length - 1]);
          const rDate = new Date(sdate.setDate(sdate.getDate() + 1));
          //available_planet = JSON.parse(data);
          const pp = $("#planetdatepick");
          if (pp.length) {
            pp.datepicker("refresh");
            // then set the date to the latest available
            pp.datepicker(
              "setDate",
              new Date(
                rDate.getUTCFullYear() +
                  "-" +
                  ("0" + (rDate.getUTCMonth() + 1)).slice(-2) +
                  "-" +
                  ("0" + rDate.getUTCDate()).slice(-2)
              )
            );
          }
        }
      }
    });
}

let pobject = {};

function todayString() {
  const date = new Date();
  return (
    date.getUTCFullYear() +
    "-" +
    ("0" + (date.getUTCMonth() + 1)).slice(-2) +
    "-" +
    ("0" + date.getUTCDate()).slice(-2)
  );
}

function getAvailableData(service, start) {
  const theJson = {
    geometry: [
      [-91.34029931757813, 14.897852537402175],
      [-91.34029931757813, 14.529926456359712],
      [-91.06152124140625, 14.529926456359712],
      [-91.06152124140625, 14.897852537402175],
    ],
    start: start,
    end: todayString(),
    band: service === "landsat" ? "NDFI" : "VV/VH",
    dataType: service,
    sensors: { l4: false, l5: false, l7: false, l8: true },
  };
  $.ajax({
      url: "https://geegateway.servirglobal.net/getImagePlotDegradition",
    type: "POST",
    async: true,
    crossDomain: true,
    contentType: "application/json",
    data: JSON.stringify(theJson),
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        refreshDatePickers(service);
      } else {
        // this is the json object
        // i can now get the dates out and add to the db
        // add dates to date picker then refresh
        let dbupdates = [];
        data.timeseries.forEach(function (element) {
          const date = new Date(element[0]);
          if (service === "landsat") {
            available_landsat.push(
              date.getUTCFullYear() +
                "-" +
                ("0" + (date.getUTCMonth() + 1)).slice(-2) +
                "-" +
                ("0" + date.getUTCDate()).slice(-2)
            );
          } else {
            available_sentinel.push(
              date.getUTCFullYear() +
                "-" +
                ("0" + (date.getUTCMonth() + 1)).slice(-2) +
                "-" +
                ("0" + date.getUTCDate()).slice(-2)
            );
          }
          dbupdates.push(
            date.getUTCFullYear() +
              "-" +
              ("0" + (date.getUTCMonth() + 1)).slice(-2) +
              "-" +
              ("0" + date.getUTCDate()).slice(-2)
          );
        });
        refreshDatePickers(service);
        // send dbupdates to database to update
        if (dbupdates.length > 0) {
          updateAvailableDatesDB(dbupdates, service);
        }
      }
    });
}

function refreshDatePickers(service) {
  let picker;
  let available_array;
  if (service === "landsat") {
    picker = $("#landsatdatepick");
    available_array = available_landsat;
  } else {
    picker = $("#sentineldatepick");
    available_array = available_sentinel;
  }
  if (picker.length) {
    picker.datepicker("refresh");
    // then set the date to the latest available
    const sdate = new Date(available_array[available_array.length - 1]);
    const rDate = new Date(sdate.setDate(sdate.getDate() + 1));
    picker.datepicker(
      "setDate",
      new Date(
        rDate.getUTCFullYear() +
          "-" +
          ("0" + (rDate.getUTCMonth() + 1)).slice(-2) +
          "-" +
          ("0" + rDate.getUTCDate()).slice(-2)
      )
    );
    var servdate = $("#" + service + "date");
    if (servdate.length > 0) {
      servdate.text(available_array[available_array.length - 1]);
    }
  } else {
    // set date here
    var fixedname = service.replace("lf", "l").replace("lt", "l");
    console.log(fixedname);
    var servdate = $("#" + fixedname + "date");

    if (servdate.length > 0) {
      servdate.text(available_array[available_array.length - 1]);
    }
  }
}

function updateAvailableDatesDB(dbArray, service) {
  let stringdates = "";

  for (let i = 0; i < dbArray.length; i++) {
    if (i === 0) {
      stringdates += "'" + dbArray[i] + "'";
    } else {
      stringdates += ",'" + dbArray[i] + "'";
    }
  }

  $.ajax({
    url: "https://freshwater.net/freshwater.net/billyz313/ajax.php",
    type: "POST",
    async: true,
    crossDomain: true,
    data: {
      service: "updateAvailableDates",
      dateList: stringdates,
      data: service,
    },
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

let available_landsat = [];
let available_sentinel = [];
let available_planet = [];
function date_checker(date, array) {
  let formatted_date = "",
    ret = [true, "", ""];
  if (date instanceof Date) {
    formatted_date = $.datepicker.formatDate("yy-mm-dd", date);
  } else {
    formatted_date = "" + date;
  }
  if (-1 === array.indexOf(formatted_date)) {
    ret[0] = false;
    ret[1] = "date-disabled"; // put yopur custom csc class here for disabled dates
    ret[2] = "Date not available"; // put your custom message here
  }
  return ret;
}
function check_available_date(date) {
  return date_checker(date, available_landsat);
}

function check_available_date_s(date) {
  return date_checker(date, available_sentinel);
}

function check_available_date_p(date) {
  return date_checker(date, available_planet);
}

$(function () {
  if ($("#landsatdatepick").length) {
    $("#landsatdatepick").datepicker({
      dateFormat: "yy-mm-dd",
      beforeShowDay: check_available_date,
      changeMonth: true,
      changeYear: true,
      minDate: new Date("2019-1-1"),
      onSelect: function (dateText) {
        removeLayer("map_Landsat");
        layerLoader(dateText, "Landsat", 0);
      },
    });
  }
  selectAvailableDates("landsat");
  if ($("#sentineldatepick").length) {
    $("#sentineldatepick").datepicker({
      dateFormat: "yy-mm-dd",
      beforeShowDay: check_available_date_s,
      changeMonth: true,
      changeYear: true,
      minDate: new Date("2019-1-1"),
      onSelect: function (dateText) {
        removeLayer("map_Sentinelt");
        removeLayer("map_Sentinelf");

        layerLoader(dateText, "Sentinelt", 1);
        layerLoader(dateText, "Sentinelf", 2);
      },
    });
  }
  selectAvailableDates("sentinel");

  if ($("#planetdatepick").length) {
    $("#planetdatepick").datepicker({
      dateFormat: "yy-mm-dd",
      beforeShowDay: check_available_date_p,
      changeMonth: true,
      changeYear: true,
      minDate: new Date("2019-1-1"),
      onSelect: function (dateText) {
        removeLayer("map_Planet");

        addStoredPlanet(pobject[getdst(dateText)]);
      },
    });
  }
  selectAvailableDates("planet");
});

function getdst(dateText) {
  const selecteddate = new Date(dateText);
  const d30 = new Date(dateText).setDate(selecteddate.getDate());
  const predst = new Date(dateText).setDate(selecteddate.getDate());
  return getDateString(new Date(predst));
}

function layerLoader(dateText, type, index) {
  var dst = getdst(dateText);
  var theDate = new Date(dst);
  dst = getDateString(new Date(theDate.setDate(theDate.getDate() + 3)));
  var ds30 = getDateString(new Date(theDate.setDate(theDate.getDate() - 3)));
  if (
    typeof Storage !== "undefined" &&
    checkForCache(type + dst) &&
    isValidCache(type + dst)
  ) {
    addTileServerURL(
      JSON.parse(localStorage.getItem(type + dst)).url,
      "map_" + type,
      type,
      index
    );
  } else {
    if (type === "Landsat") {
      getImageCollection(
        "LANDSAT/LC08/C01/T1_TOA",
        ds30,
        dst,
        {
          bands: "B4,B3,B2",
          max: "0.3",
        },
        "Landsat",
        index,
        true
      );
    } else if (type === "Sentinelf") {
      getImageCollection(
        "COPERNICUS/S2",
        ds30,
        dst,
        {
          bands: "B12,B8,B4",
          min: "0",
          max: "3500",
        },
        "Sentinelf",
        index,
        true
      );
    } else if (type === "Sentinelt") {
      getImageCollection(
        "COPERNICUS/S2",
        ds30,
        dst,
        { bands: "B4,B3,B2", min: "0", max: "3500" },
        "Sentinelt",
        1,
        true
      );
    }
  }
}
