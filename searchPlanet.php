<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
$url = "https://ceodev.servirglobal.net/geo-dash/gateway-request";


$items = array(
    0 => 'PSScene3Band',
    1 => 'PSScene4Band',
);

$geom = array(
    0 =>
    array(
        0 => -91.34029931757813,
        1 => 14.897852537402175,
    ),
    1 =>
    array(
        0 => -91.34029931757813,
        1 => 14.529926456359712,
    ),
    2 =>
    array(
        0 => -91.06152124140625,
        1 => 14.529926456359712,
    ),
    3 =>
    array(
        0 => -91.06152124140625,
        1 => 14.897852537402175,
    ),
);

// Create map with request parameters

$params = array(
    "apiKey" => "2dfd44b76cf64b64b3152e3795bdb85f",
    "geometry" => $geom,
    "dateFrom" => "2020-08-01",
    "dateTo" => "2020-08-10",
    "path" => "getPlanetTile"
);

$postData = json_encode($params);

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, "data=$postData");
curl_setopt($ch, CURLOPT_ENCODING, "");
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, "spider");
curl_setopt($ch, CURLOPT_AUTOREFERER, true);
curl_setopt($ch, CURLOPT_VERBOSE, true);

$output = curl_exec($ch);


curl_close($ch);
echo ($output);
