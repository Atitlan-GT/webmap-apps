<?php

$url = "";

if (isset($_GET['url'])) {
    $url = $_GET['url'] . "?api_key=YOUR_KEY_HERE";
} else {
    exit();
}

$imginfo = getimagesize($url);

header("Content-type: " . $imginfo['mime']);

readfile($url);
