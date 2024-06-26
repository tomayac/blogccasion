<?php
  header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

  if (!$_GET['dl'] && !$_GET['dp']) {
    return http_response_code(403);
  }

  $_POST['uip'] = $_SERVER['REMOTE_ADDR'];
  $_POST['v'] = 1;
  $_POST['tid'] = 'UA-2040927-13';
  $_POST['t'] = 'pageview';
  $_POST['z'] = substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil(17/strlen($x)) )),1,17);
  $_POST['cid'] = substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil(17/strlen($x)) )),1,17);
  $_POST['ua'] = $_SERVER['HTTP_USER_AGENT'];
  $_POST['dr'] = 'https://feed.tomayac.com/feed/feed.xml';
  $_POST['ul'] = $_SERVER['HTTP_ACCEPT_LANGUAGE'] || '';
  $_POST['dl'] = $_GET['dl'];
  $_POST['dp'] = $_GET['dp'];
  $_POST['dt'] = $_GET['dt'];

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
    header('Content-Type: image/jpeg');
    echo base64_decode('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');
  } else {
    header('HTTP/1.1 502 Bad Gateway');
  }

  curl_close($ch);
?>
