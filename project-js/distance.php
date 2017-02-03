<?php
$key = 'AIzaSyC_rT7-qgUX6wUx1kTjWRQOxK6Q9trOVJA ';
$start = $_GET['start'];
$finish = $_GET['finish'];
$transport = $_GET['transport'];
$url = 'https://maps.googleapis.com/maps/api/distancematrix/json…' . urlencode($start) . '&destinations=' . urlencode($finish) . '&key='. urlencode($key) .'&travelmode=' . urlencode($transport) . '&departure_time=now';
$json = file_get_contents($url);
echo $json;
?>