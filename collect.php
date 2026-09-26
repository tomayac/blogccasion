<?php
  // Forwards the events that `js/collect.mjs` sends to the Google Analytics 4
  // Measurement Protocol, adding the reader's IP address so that Analytics can
  // derive their location. Google uses the IP address for geolocation and
  // does not store it.
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

  // The events `js/collect.mjs` sends, with each one's parameters and their
  // maximum lengths (or `int`). Everything else is dropped. GA4 truncates
  // parameter values at 100 characters, except for the page parameters.
  const PAGE_PARAMS = ['page_location' => 1000, 'page_title' => 300];
  const EVENTS = [
    'page_view' => ['page_referrer' => 420],
    'page_engagement' => [],
    'scroll' => ['percent_scrolled' => 'int'],
    'click' => ['link_url' => 100, 'link_domain' => 100, 'outbound' => 5],
    'file_download' => [
      'file_extension' => 10,
      'file_name' => 100,
      'link_url' => 100,
      'link_text' => 100,
    ],
    'view_search_results' => ['search_term' => 100],
  ];

  // Crawlers that run JavaScript, such as Googlebot, would otherwise count as
  // readers: the regular tag's bot filtering does not apply here.
  const BOTS = '/bot\b|bot\/|crawl|spider|slurp|mediapartners|facebookexternalhit|embedly|headless|lighthouse|pagespeed|ptst|gtmetrix|python|curl|wget|go-http|node-fetch|axios|java\//i';

  header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    return http_response_code(405);
  }
  if (($_SERVER['HTTP_ORIGIN'] ?? '') !== 'https://blog.tomayac.com') {
    return http_response_code(403);
  }

  $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
  if ($userAgent === '' || preg_match(BOTS, $userAgent)) {
    return http_response_code(204);
  }

  $config = @parse_ini_file(CONFIG_FILE);
  if (empty($config['api_secret'])) {
    error_log('collect.php: no api_secret in ' . CONFIG_FILE);
    return http_response_code(503);
  }

  $hit = json_decode(file_get_contents('php://input'), true);
  if (!is_array($hit) || !is_string($hit['cid'] ?? null) ||
      !preg_match('/^[\w.-]{1,64}$/', $hit['cid']) ||
      !is_int($hit['sid'] ?? null) || $hit['sid'] <= 0 ||
      !is_array($hit['events'] ?? null)) {
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

  $events = [];
  // GA4 takes at most 25 events per request.
  foreach (array_slice($hit['events'], 0, 25) as $event) {
    $name = $event['name'] ?? null;
    if (!is_string($name) || !isset(EVENTS[$name]) ||
        !is_array($event['params'] ?? null)) {
      continue;
    }
    $params = [];
    foreach (PAGE_PARAMS + EVENTS[$name] as $key => $max) {
      $value = $event['params'][$key] ?? null;
      if ($max === 'int') {
        if (is_int($value)) {
          $params[$key] = $value;
        }
      } elseif ($value = param($value, $max)) {
        $params[$key] = $value;
      }
    }
    // GA4 needs both for sessions, engagement, and Realtime.
    $params['session_id'] = $hit['sid'];
    $time = $event['params']['engagement_time_msec'] ?? null;
    $params['engagement_time_msec'] = is_int($time) && $time > 0
      ? min($time, 24 * 60 * 60 * 1000)
      : 1;
    $events[] = ['name' => $name, 'params' => $params];
  }
  if (!$events) {
    return http_response_code(400);
  }

  $device = array_filter(
    array_merge(
      parseUserAgent($userAgent, ($hit['touch'] ?? false) === true),
      parseClientHints($hit['ch'] ?? null),
      [
        'language' => param($hit['ul'] ?? null, 20),
        'screen_resolution' => preg_match('/^\d{1,5}x\d{1,5}$/', $hit['sr'] ?? '')
          ? $hit['sr']
          : '',
      ]
    )
  );

  $body = [
    'client_id' => $hit['cid'],
    'ip_override' => $_SERVER['REMOTE_ADDR'],
    'user_agent' => $userAgent,
    // Nothing here is used for ads.
    'consent' => [
      'ad_user_data' => 'DENIED',
      'ad_personalization' => 'DENIED',
    ],
    'events' => $events,
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

  // Derives the device fields from the `User-Agent` string, for the browsers
  // that send no client hints (Safari, Firefox). Several values in it are
  // frozen and no longer tell the truth; those are left out, since no value
  // beats a wrong one.
  function parseUserAgent($ua, $touch) {
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
    } elseif (str_contains($ua, 'Macintosh') && $touch) {
      // iPadOS pretends to be a Mac. Its Safari shares the system's version.
      $device['operating_system'] = 'iOS';
      if (($device['browser'] ?? '') === 'Safari') {
        $device['operating_system_version'] = $device['browser_version'];
      }
      $device['brand'] = 'Apple';
      $device['model'] = 'iPad';
      $device['category'] = 'tablet';
    } elseif (preg_match('/Android ([\d.]+)(?:; ([^;)]+))?/', $ua, $m)) {
      $device['operating_system'] = 'Android';
      $device['category'] = str_contains($ua, 'Mobile') ? 'mobile' : 'tablet';
      // Chrome reports every device as "Android 10; K".
      if (($m[2] ?? '') !== 'K') {
        $device['operating_system_version'] = $m[1];
      }
    } elseif (preg_match('/Mac OS X ([\d_.]+)/', $ua, $m)) {
      $device['operating_system'] = 'Macintosh';
      $device['brand'] = 'Apple';
      $device['category'] = 'desktop';
      // Safari, Chrome, and Firefox stopped at 10.15.7 or 10.15.
      $version = str_replace('_', '.', $m[1]);
      if (!in_array($version, ['10.15', '10.15.7'], true)) {
        $device['operating_system_version'] = $version;
      }
    } elseif (str_contains($ua, 'Windows')) {
      // "Windows NT 10.0" stands for both Windows 10 and 11.
      $device['operating_system'] = 'Windows';
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
