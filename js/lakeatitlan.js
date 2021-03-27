let map;
let sss;
let url = "https://ceodev.servirglobal.net:8888/";

$(function () {
  map = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([-91.1898, 14.68556]),
      zoom: 13,
    }),
  });

  let today = new Date();
  let d30 = new Date().setDate(today.getDate() - 30);
  let dst = getDateString(today);
  let ds30 = getDateString(new Date(d30));
  if (
    typeof Storage !== "undefined" &&
    checkForCache("Landsat" + dst) &&
    isValidCache("Landsat" + dst)
  ) {
    addTileServerURL(
      JSON.parse(localStorage.getItem("Landsat" + dst)).url,
      "map_Landsat",
      "Landsat",
      0,
      "GEE"
    );
  } else {
    getImageCollection(
      "LANDSAT/LC08/C01/T1_TOA",
      ds30,
      dst,
      { bands: "B4,B3,B2", max: "0.3" },
      "Landsat",
      0,
      "GEE"
    );
  }
  if (
    typeof Storage !== "undefined" &&
    checkForCache("Sentinelt" + dst) &&
    isValidCache("Sentinelt" + dst)
  ) {
    addTileServerURL(
      JSON.parse(localStorage.getItem("Sentinelt" + dst)).url,
      "map_Sentinelt",
      "Sentinelt",
      1,
      "GEE"
    );
  } else {
    getImageCollection(
      "COPERNICUS/S2",
      ds30,
      dst,
      { bands: "B4,B3,B2", min: "0", max: "3500" },
      "Sentinelt",
      1,
      "GEE"
    );
  }
  if (
    typeof Storage !== "undefined" &&
    checkForCache("Sentinelf" + dst) &&
    isValidCache("Sentinelf" + dst)
  ) {
    addTileServerURL(
      JSON.parse(localStorage.getItem("Sentinelf" + dst)).url,
      "map_Sentinelf",
      "Sentinelf",
      2,
      "GEE"
    );
  } else {
    getImageCollection(
      "COPERNICUS/S2",
      ds30,
      dst,
      { bands: "B12,B8,B4", min: "0", max: "3500" },
      "Sentinelf",
      2,
      "GEE"
    );
  }

  getLatestPlanetFromDB();
});

function isValidCache(which) {
  try {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    const mapinfo = JSON.parse(localStorage.getItem(which));
    if (new Date(mapinfo.lastGatewayUpdate) > new Date(currentDate)) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

function getLatestPlanetFromDB() {
  $.ajax({
    url: "https://freshwater.net/freshwater.net/billyz313/ajax.php",
    type: "POST",
    async: true,
    crossDomain: true,
    data: {
      service: "getLatestPlanet",
    },
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        console.info(data.errMsg);
      } else {
        sss = data;
        addStoredPlanet(JSON.parse(data)[0][1]);
        let ntime = new Date(JSON.parse(sss)[0][0]);
        const pdp = $("#planetdatepick");
        if (pdp.length) {
          ntime.setMinutes(ntime.getTimezoneOffset());
          pdp.datepicker("setDate", new Date(ntime));
        }
        const pdt = $("#planetdate");
        if (pdt.length) {
          ntime.setMinutes(ntime.getTimezoneOffset());
          pdt.text(JSON.parse(sss)[0][0]);
        }
      }
    });
}

function addStoredPlanet(which) {
  try {
    removeLayer("map_Planet");
  } catch (e) {}
  addTileServerURL(
    "https://freshwater.net/freshwater.net/billyz313/planetproxy.php?url=https://tiles{0-3}.planet.com/data/v1/layers/" +
      which +
      "/{z}/{x}/{y}",
    "map_Planet",
    "Planet",
    3,
    "Planet Labs"
  );
}

function checkForCache(key) {
  return localStorage.getItem(key);
}

function getDateString(td) {
  if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
      targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
      padString = String(typeof padString !== "undefined" ? padString : " ");
      if (this.length > targetLength) {
        return String(this);
      } else {
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
        }
        return padString.slice(0, targetLength) + String(this);
      }
    };
  }
  return (
    td.getUTCFullYear() +
    "-" +
    String(td.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(td.getUTCDate()).padStart(2, "0")
  );
}

function getImageCollection(
  collection,
  from,
  to,
  visParams,
  name,
  index,
  range
) {
  const gatewayurl = range ? url + "getRangedImage" : url + "getLatestImage";
  $.ajax({
    url: gatewayurl,
    type: "POST",
    async: true,
    crossDomain: true,
    contentType: "application/json",
    data: JSON.stringify({
      imageCollection: collection,
      dateFrom: from,
      dateTo: to,
      visParams: visParams,
    }),
    name: name,
    dateTo: to,
  })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.warn(jqXHR + textStatus + errorThrown);
    })
    .done(function (data, _textStatus, _jqXHR) {
      if (data.errMsg) {
        console.info(data.errMsg);
      } else {
        if (data.hasOwnProperty("url")) {
          const $this = this;
          addTileServerURL(
            data.url,
            "map_" + $this.name,
            $this.name,
            index,
            "GEE"
          );
          data.lastGatewayUpdate = new Date();
          localStorage.setItem($this.name + $this.dateTo, JSON.stringify(data));
        } else {
          console.warn("Wrong Data Returned");
        }
      }
    });
}

function removeLayer(id) {
  map.getLayers().forEach(function (layer) {
    try {
      if (layer.get("id") !== undefined && layer.get("id") === id) {
        map.removeLayer(layer);
      }
    } catch (e) {}
  });
}

function addTileServerURL(url, mapdiv, layerName, index, attribution) {
  const xyzTileLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: url,
      attributions: [attribution],
    }),
    id: mapdiv,
    title: layerName,
    zIndex: index,
    attributions: [attribution],
  });
  map.addLayer(xyzTileLayer);
  addOpacityListener(layerName);
}

function toggleLayer(which, isVisible) {
  map.getLayers().forEach(function (layer) {
    if (layer.get("title") !== undefined && layer.get("title") === which) {
      layer.setVisible(isVisible);
    }
  });
}

function addOpacityListener(which) {
  const opacityElement = $("#" + which + "opacity");
  if (opacityElement.length > 0) {
    if (isIE()) {
      onRangeChange(document.getElementById(which + "opacity"), myListener);
    } else {
      opacityElement.on("input", function () {
        updateOpacity(which, $(this).val());
      });
    }
  } else {
    window.setTimeout(function () {
      addOpacityListener(which);
    }, 250);
  }
}

function updateOpacity(which, val) {
  map.getLayers().forEach(function (layer) {
    if (layer.get("title") !== undefined && layer.get("title") === which) {
      layer.setOpacity(val / 100);
    }
  });
}

function onRangeChange(r, f) {
  let n, c, m;
  r.addEventListener("input", function (e) {
    n = 1;
    c = e.target.value;
    if (c !== m) f(e);
    m = c;
  });
  r.addEventListener("change", function (e) {
    if (!n) f(e);
  });
}

function myListener(evt) {
  updateOpacity(evt.target.id.replace("opacity", ""), evt.target.value);
  //updateOpacity(evt.srcElement.id.replace('opacity', ''), evt.srcElement.value);
}

function isIE() {
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf("MSIE ");
  //if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./)) {
    // If Internet Explorer, return version number
    return true;
  } // If another browser, return 0
  else {
    //alert('otherbrowser');
  }
  return false;
}
let isNavOpen = false;

function toggleNav() {
  if (isNavOpen) {
    closeNav();
  } else {
    openNav();
  }
}
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("sideNavHandle").style.left = "263px";
  document.getElementById("main").style.width = "calc(100vw - 263px)";
  document.getElementById("mySidenav").style.width = "263px";
  document.getElementById("main").style.marginLeft = "263px";
  document.getElementById("layermgr").style.left = "268px";
  map.updateSize();
  window.dispatchEvent(new Event("resize"));
  isNavOpen = true;
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("sideNavHandle").style.left = "0";
  document.getElementById("main").style.width = "100vw";
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementById("layermgr").style.left = ".5em";
  map.updateSize();
  window.dispatchEvent(new Event("resize"));
  isNavOpen = false;
}
