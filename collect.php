<?php
  header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    return http_response_code(405);
  }
  if ($_SERVER['HTTP_ORIGIN'] !== 'https://blog.tomayac.com') {
    return http_response_code(403);
  }

  header('Access-Control-Allow-Origin: https://blog.tomayac.com');

  $_POST['uip'] = $_SERVER['REMOTE_ADDR'];
  $_POST['v'] = 1;
  $_POST['tid'] = 'UA-2040927-13';
  $_POST['t'] = 'pageview';
  $_POST['z'] = 'rand' . $_POST['z'];

  $ch = curl_init();

  curl_setopt($ch, CURLOPT_USERAGENT, $_POST['ua']);
  curl_setopt($ch, CURLOPT_HEADER, true);
  curl_setopt($ch, CURLOPT_NOBODY, true);
  curl_setopt($ch, CURLOPT_URL, 'https://www.google-analytics.com/collect');
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($_POST));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $output = curl_exec($ch);
  $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

  if ($responseCode === 200) {
    header('HTTP/1.1 204 No Content');
  } else {
    header('HTTP/1.1 502 Bad Gateway');
  }

  curl_close($ch);
?>
