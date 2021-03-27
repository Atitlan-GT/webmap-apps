﻿//getDayAtAGlance

$(function () {
  $.ajax({
    url: "https://freshwater.net/freshwater.net/billyz313/ajax.php",
    type: "POST",
    async: true,
    crossDomain: true,
    data: { service: "getDayAtAGlance" },
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        console.info(data.errMsg);
      } else {
        rd = data;
        var element = JSON.parse(data);
        console.log(element);
        var st =
          element[0][1] == null
            ? "N/A"
            : (element[0][1] - 273.15).toFixed(2) + String.fromCharCode(176);
        $("#surfacetemp").text(st);

        var lt =
          element[0][2] == null
            ? "N/A"
            : (element[0][2] - 273.15).toFixed(2) + String.fromCharCode(176);
        $("#laketemp").text(lt);

        var da = element[0][3] == null ? "N/A" : element[0][3] + '"';
        $("#dailyacc").text(da);
        $("#stdate").text(element[0][0]);
        $("#ltdate").text(element[0][0]);
        $("#dadate").text(element[0][0]);
      }
    });

  // make ajax call to listLatestProbByRange
  // fill variable

  $.ajax({
    url: "https://freshwater.net/freshwater.net/billyz313/ajax.php",
    type: "POST",
    async: true,
    crossDomain: true,
    data: { service: "listLatestProbByRange" },
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        console.info(data.errMsg);
      } else {
        rd = data;
        var element = JSON.parse(data);
        var numpct = element[0][1] == null ? "N/A" : parseInt(element[0][1]);

        var pct = numpct + "%";
        $("#percent").text(pct);

        if (numpct !== "N/A" && numpct > 0.5) {
          $("#yesnobloom").text("YES");
        } else if (numpct !== "N/A" && numpct <= 0.5) {
          $("#yesnobloom").text("NO");
        }
      }
    });

  // get latest landsat and sentinel
});
