// Collects page views and reader interactions and hands them to
// `collect.php`, which forwards them to the Google Analytics 4 Measurement
// Protocol along with the reader's IP address. The Measurement Protocol
// records nothing on its own, so this recreates what the regular tag and its
// enhanced measurement would: engagement time, scrolls, outbound clicks, file
// downloads, and site searches.

// GA4 ends a session after 30 minutes without activity.
const SESSION_TIMEOUT = 30 * 60 * 1000;
// Enhanced measurement's list of download extensions.
const DOWNLOAD_EXTENSIONS =
  /\.(pdf|xlsx?|docx?|txt|rtf|csv|exe|key|pp[st]x?|7z|pkg|rar|gz|zip|avi|mov|mp4|mpe?g|wmv|midi?|mp3|wav|wma)$/i;

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

// Engagement time, as GA4 counts it: the time the page is visible. Each event
// carries the time accumulated since the previous one, and GA4 sums them up.
let engagedSince = document.visibilityState === 'visible' ? 0 : null;
let engaged = 0;

const takeEngagementTime = () => {
  const now = performance.now();
  if (engagedSince !== null) {
    engaged += now - engagedSince;
    engagedSince = now;
  }
  const time = Math.round(engaged);
  engaged = 0;
  return time;
};

const clientHints = getClientHints();

const send = async (name, params = {}) => {
  // The time is taken before anything is awaited, so it belongs to this event.
  const engagementTime = takeEngagementTime();
  try {
    await fetch('/collect.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        cid: getClientId(),
        sid: getSessionId(),
        ul: navigator.language,
        sr: `${screen.width}x${screen.height}`,
        // iPadOS sends the `User-Agent` string of a Mac, but Macs have no
        // touch screen.
        touch: navigator.maxTouchPoints > 1,
        ch: await clientHints,
        events: [
          {
            name,
            params: {
              // GA4 attributes each event to the page in its own parameters.
              page_location: location.href,
              page_title: document.title,
              ...params,
              engagement_time_msec: engagementTime,
            },
          },
        ],
      }),
    });
  } catch {
    // Analytics must never break the page.
  }
};

const trackEngagement = () => {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      engagedSince = performance.now();
      return;
    }
    if (engagedSince !== null) {
      engaged += performance.now() - engagedSince;
      engagedSince = null;
    }
    // `user_engagement`, the regular tag's event for this, is reserved.
    if (engaged >= 1) {
      send('page_engagement');
    }
  });
};

const trackScroll = () => {
  const onScroll = () => {
    const { scrollHeight } = document.documentElement;
    if ((scrollY + innerHeight) / scrollHeight >= 0.9) {
      removeEventListener('scroll', onScroll);
      send('scroll', { percent_scrolled: 90 });
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
};

const trackLinks = () => {
  const onClick = (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link || !/^https?:$/.test(link.protocol)) {
      return;
    }
    const fileName = link.pathname.split('/').pop();
    const extension = fileName.match(DOWNLOAD_EXTENSIONS)?.[1];
    if (extension) {
      send('file_download', {
        file_extension: extension.toLowerCase(),
        file_name: fileName,
        link_url: link.href,
        link_text: link.textContent.trim(),
      });
    } else if (link.hostname !== location.hostname) {
      send('click', {
        link_url: link.href,
        link_domain: link.hostname,
        outbound: 'true',
      });
    }
  };
  // `auxclick` catches links opened with the middle mouse button.
  document.addEventListener('click', onClick, { capture: true });
  document.addEventListener(
    'auxclick',
    (event) => event.button === 1 && onClick(event),
    { capture: true }
  );
};

// Pagefind searches as the reader types, so count a search once typing pauses.
const trackSearch = () => {
  let timeout = null;
  let lastTerm = '';
  document.addEventListener('input', (event) => {
    if (!event.target.matches?.('.pagefind-ui__search-input')) {
      return;
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const term = event.target.value.trim();
      if (term.length >= 3 && term !== lastTerm) {
        lastTerm = term;
        send('view_search_results', { search_term: term });
      }
    }, 2000);
  });
};

// Automated browsers and readers who ask not to be tracked are skipped.
if (!navigator.webdriver && !navigator.globalPrivacyControl) {
  send('page_view', { page_referrer: document.referrer });
  trackEngagement();
  trackScroll();
  trackLinks();
  trackSearch();
}
