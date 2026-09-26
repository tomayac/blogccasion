<?php
  // Forwards the page views that `js/collect.mjs` sends to the Google
  // Analytics 4 Measurement Protocol, adding the reader's IP address so that
  // Analytics can derive their location. Google uses the IP address for
  // geolocation and does not store it.
  //
  // The API secret stays out of this (public) repository. Create it in
  // Analytics under Admin > Data streams > the web stream > Measurement
  // Protocol API secrets, and store it on the server, readable by PHP-FPM:
  //
  //   sudo install -d -m 750 -o root -g www-data /etc/blogccasion
  //   echo 'api_secret = "<secret>"' | sudo tee /etc/blogccasion/analytics.ini
  //   sudo chown root:www-data /etc/blogccasion/analytics.ini
  //   sudo chmod 640 /etc/blogccasion/analytics.ini

  const MEASUREMENT_ID = 'G-X5YY4098KH';
  const CONFIG_FILE = '/etc/blogccasion/analytics.ini';
  // The EU endpoint keeps the data in the EU.
  const ENDPOINT = 'https://region1.google-analytics.com/mp/collect';

  header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    return http_response_code(405);
  }
  if (($_SERVER['HTTP_ORIGIN'] ?? '') !== 'https://blog.tomayac.com') {
    return http_response_code(403);
  }

  header('Access-Control-Allow-Origin: https://blog.tomayac.com');

  $config = @parse_ini_file(CONFIG_FILE);
  if (empty($config['api_secret'])) {
    error_log('collect.php: no api_secret in ' . CONFIG_FILE);
    return http_response_code(503);
  }

  $hit = json_decode(file_get_contents('php://input'), true);
  if (!is_array($hit) || !is_string($hit['cid'] ?? null) ||
      !preg_match('/^[\w.-]{1,64}$/', $hit['cid']) ||
      !is_int($hit['sid'] ?? null) || $hit['sid'] <= 0) {
    return http_response_code(400);
  }

  // Trims a client-supplied string to what GA4 accepts as a parameter value.
  // The server has no `mbstring`, so count characters with a UTF-8 regex,
  // which also rejects malformed UTF-8.
  function param($value, $max = 100) {
    return is_string($value) && preg_match("/^.{0,$max}/su", $value, $m)
      ? $m[0]
      : '';
  }

  $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
  $device = array_filter(
    array_merge(
      parseUserAgent($userAgent),
      parseClientHints($hit['ch'] ?? null),
      [
        'language' => param($hit['ul'] ?? null, 20),
        'screen_resolution' => preg_match('/^\d{1,5}x\d{1,5}$/', $hit['sr'] ?? '')
          ? $hit['sr']
          : '',
      ]
    )
  );

  // `page_location` and `page_referrer` may be up to 1,000 characters long.
  $params = array_filter([
    'page_location' => param($hit['dl'] ?? null, 1000),
    'page_referrer' => param($hit['dr'] ?? null, 1000),
    'page_title' => param($hit['dt'] ?? null, 300),
  ]);
  // Without these two, the hit counts in neither sessions nor Realtime.
  $params['session_id'] = $hit['sid'];
  $params['engagement_time_msec'] = 1;

  $body = [
    'client_id' => $hit['cid'],
    'ip_override' => $_SERVER['REMOTE_ADDR'],
    'events' => [['name' => 'page_view', 'params' => $params]],
  ];
  if ($device) {
    $body['device'] = $device;
  }

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, ENDPOINT . '?' . http_build_query([
    'measurement_id' => MEASUREMENT_ID,
    'api_secret' => $config['api_secret'],
  ]));
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
  curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 5);
  curl_exec($ch);
  $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  // The Measurement Protocol answers 2xx even for hits it discards. Use
  // `/debug/mp/collect` to validate them.
  http_response_code($responseCode >= 200 && $responseCode < 300 ? 204 : 502);

  // The GA4 Measurement Protocol does not parse the `User-Agent` header, so
  // derive the device fields from it. Covers the browsers that send no client
  // hints (Safari, Firefox) well enough for reports.
  function parseUserAgent($ua) {
    $device = [];
    $browsers = [
      'Edge' => '/Edg(?:e|A|iOS)?\/([\d.]+)/',
      'Opera' => '/OPR\/([\d.]+)/',
      'Samsung Internet' => '/SamsungBrowser\/([\d.]+)/',
      'Firefox' => '/(?:Firefox|FxiOS)\/([\d.]+)/',
      'Chrome' => '/(?:Chrome|CriOS)\/([\d.]+)/',
      'Safari' => '/Version\/([\d.]+).*Safari\//',
    ];
    foreach ($browsers as $name => $pattern) {
      if (preg_match($pattern, $ua, $m)) {
        $device['browser'] = $name;
        $device['browser_version'] = $m[1];
        break;
      }
    }
    if (preg_match('/(iPhone|iPad|iPod).*? OS ([\d_]+)/', $ua, $m)) {
      $device['operating_system'] = 'iOS';
      $device['operating_system_version'] = str_replace('_', '.', $m[2]);
      $device['brand'] = 'Apple';
      $device['model'] = $m[1];
      $device['category'] = $m[1] === 'iPad' ? 'tablet' : 'mobile';
    } elseif (preg_match('/Android ([\d.]+)/', $ua, $m)) {
      $device['operating_system'] = 'Android';
      $device['operating_system_version'] = $m[1];
      $device['category'] = str_contains($ua, 'Mobile') ? 'mobile' : 'tablet';
    } elseif (preg_match('/Mac OS X ([\d_]+)/', $ua, $m)) {
      $device['operating_system'] = 'Macintosh';
      $device['operating_system_version'] = str_replace('_', '.', $m[1]);
      $device['brand'] = 'Apple';
      $device['category'] = 'desktop';
    } elseif (preg_match('/Windows NT ([\d.]+)/', $ua, $m)) {
      $device['operating_system'] = 'Windows';
      $device['operating_system_version'] = $m[1];
      $device['category'] = 'desktop';
    } elseif (str_contains($ua, 'CrOS')) {
      $device['operating_system'] = 'Chrome OS';
      $device['category'] = 'desktop';
    } elseif (str_contains($ua, 'Linux')) {
      $device['operating_system'] = 'Linux';
      $device['category'] = 'desktop';
    }
    return $device;
  }

  // User-Agent Client Hints are more precise than the frozen `User-Agent`
  // string of Chromium browsers, so they win where present.
  function parseClientHints($ch) {
    if (!is_array($ch)) {
      return [];
    }
    $device = [];
    if (is_bool($ch['mobile'] ?? null) && $ch['mobile']) {
      $device['category'] = 'mobile';
    }
    $platforms = ['macOS' => 'Macintosh'];
    if ($platform = param($ch['platform'] ?? null)) {
      $device['operating_system'] = $platforms[$platform] ?? $platform;
    }
    if ($platformVersion = param($ch['platformVersion'] ?? null)) {
      $device['operating_system_version'] = $platformVersion;
    }
    if ($model = param($ch['model'] ?? null)) {
      $device['model'] = $model;
    }
    // Prefer the specific brand (Edge, Opera, …) over the engine.
    $brand = null;
    foreach (is_array($ch['fullVersionList'] ?? null) ? $ch['fullVersionList'] : [] as $entry) {
      $name = param($entry['brand'] ?? null);
      if (!$name || preg_match('/Not.?A.?Brand/i', $name)) {
        continue;
      }
      if (!$brand || $brand['name'] === 'Chromium') {
        $brand = ['name' => $name, 'version' => param($entry['version'] ?? null)];
      }
    }
    if ($brand) {
      $names = ['Google Chrome' => 'Chrome', 'Microsoft Edge' => 'Edge'];
      $device['browser'] = $names[$brand['name']] ?? $brand['name'];
      $device['browser_version'] = $brand['version'];
    }
    return $device;
  }
?>
