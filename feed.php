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
  $_POST['dr'] = 'https://blog.tomayac.com/feed/feed.xml';
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
    header('Content-Type: image/gif');
    echo base64_decode('R0lGODlhAQABAJAAAP8AAAAAACH5BAUQAAAALAAAAAABAAEAAAICBAEAOw==');
  } else {
    header('HTTP/1.1 502 Bad Gateway');
  }

  curl_close($ch);
?>
