// Collects a page view and hands it to `collect.php`, which forwards it to the
// Google Analytics 4 Measurement Protocol along with the reader's IP address.

// GA4 ends a session after 30 minutes without activity.
const SESSION_TIMEOUT = 30 * 60 * 1000;

const storage = (() => {
  try {
    localStorage.setItem('_', '_');
    localStorage.removeItem('_');
    return localStorage;
  } catch {
    return null;
  }
})();

const getClientId = () => {
  let cid = storage?.getItem('cid');
  if (!cid) {
    cid = `${crypto.getRandomValues(new Uint32Array(1))[0]}.${Math.floor(
      Date.now() / 1000
    )}`;
    storage?.setItem('cid', cid);
  }
  return cid;
};

// GA4 expects the session ID to be the session's start time in seconds.
const getSessionId = () => {
  const now = Date.now();
  let session = null;
  try {
    session = JSON.parse(storage?.getItem('sid'));
  } catch {
    // Start a new session.
  }
  if (!session || now - session.last > SESSION_TIMEOUT) {
    session = { id: Math.floor(now / 1000) };
  }
  session.last = now;
  storage?.setItem('sid', JSON.stringify(session));
  return session.id;
};

// User-Agent Client Hints, where supported. `collect.php` parses the
// `User-Agent` header for the other browsers.
const getClientHints = async () => {
  if (!navigator.userAgentData) {
    return null;
  }
  const { mobile, platform } = navigator.userAgentData;
  try {
    const { platformVersion, model, fullVersionList } =
      await navigator.userAgentData.getHighEntropyValues([
        'platformVersion',
        'model',
        'fullVersionList',
      ]);
    return { mobile, platform, platformVersion, model, fullVersionList };
  } catch {
    return { mobile, platform };
  }
};

// No top-level `await`: the build minifies this file as a script.
(async () => {
  try {
    await fetch('/collect.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        cid: getClientId(),
        sid: getSessionId(),
        dl: location.href,
        dr: document.referrer,
        dt: document.title,
        ul: navigator.language,
        sr: `${screen.width}x${screen.height}`,
        ch: await getClientHints(),
      }),
    });
  } catch {
    // Analytics must never break the page.
  }
})();
