var debuge;
function getDatesByRange(service, start, end, element) {
  theJson = {
    service: service, //listProbByRange
    start: start,
    end: end,
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
        rd = data;
        var parsedData = JSON.parse(data);
        if (element === "chartcontainer") {
          chartData(parsedData, element, "Probability");
        } else {
          var landtemp = [];
          var laketemp = [];
          debuge = parsedData;
          parsedData.forEach((element) => {
            landtemp.push([
              element[0],
              element[1][0] == null ? null : element[1][0] - 273.15,
            ]);
            laketemp.push([
              element[0],
              element[1][1] == null ? null : element[1][1] - 273.15,
            ]);
          });
          chartData(landtemp, "landtempchart", "Land Mean Temp");
          chartData(laketemp, "laketempchart", "Lake Mean Temp");
          $("#landtempchart").hide();
          $("#laketempchart").hide();
        }
      }
    });
}

function chartData(data, container, text) {
  new Highcharts.chart(
    container,
    {
      chart: {
        zoomType: "x",
      },
      title: {
        text: text,
      },
      subtitle: {
        text:
          document.ontouchstart === undefined
            ? "Click and drag in the plot area to zoom in"
            : "Pinch the chart to zoom in",
      },
      xAxis: {
        type: "datetime",
      },
      yAxis: {
        title: {
          text: text,
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, "rgba(255,0,0, 0.5)"],
              [0.25, "rgba(247,148,3, 1)"],
              [0.5, "rgba(0, 204, 0, 0.5)"],
              [1, "rgba(0,0,255,1)"],
            ],
          },
          marker: {
            radius: 2,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        },
        series: {
          cursor: "pointer",
          point: {
            events: {
              click: function () {
                console.log("Date: " + this.x + ", value: " + this.y);
                var now = new Date(this.x);

                var day = ("0" + now.getUTCDate()).slice(-2);
                var month = ("0" + (now.getUTCMonth() + 1)).slice(-2);

                var selectedDate =
                  now.getUTCFullYear() + "-" + month + "-" + day;

                // $('#selectDate').val(selectedDate);
                //processDate();
              },
            },
          },
          connectNulls: true,
        },
      },

      series: [
        {
          type: container === "chartcontainer" ? "line" : "area",
          name: text,
          data: (() => {
            return data.map(function (point) {
              return [Date.parse(point[0]), point[1]];
            });
          })(),
        },
      ],
    },
    function (chart) {
      setTimeout(function () {
        map.updateSize();
      }, 500);
    }
  );
}

function toggleGraph(which) {
  $("#chartcontainer").hide();
  $("#laketempchart").hide();
  $("#landtempchart").hide();

  $("#" + which).show();
  window.dispatchEvent(new Event("resize"));
}

$(() => {
  var now = new Date();

  var day = ("0" + now.getUTCDate()).slice(-2);
  var month = ("0" + (now.getUTCMonth() + 1)).slice(-2);

  var selectedDate = now.getUTCFullYear() + "-" + month + "-" + day;
  getDatesByRange(
    "listProbByRange",
    "2019-01-01",
    selectedDate,
    "chartcontainer"
  );
  getDatesByRange("listMeansByRange", "2019-01-01", selectedDate);
});
