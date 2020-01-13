(async (r, l, s, d, h, e, u, n, i, c) => {
  const o = {
    z: `${r()}`.substr(2),
    cid: `${l.getItem(i) || (c = `${r()}`.substr(2), l.setItem(i, c), c)}`,
    ua: n.userAgent,
    dr: d.referrer || '',
    sr: `${s.width}x${s.height}`,
    vp: `${h.clientWidth}x${h.clientHeight}`,
    sd: `${s.pixelDepth}-bits`,
    ul: n.language,
    dl: e(u.href),
    dp: e(u.pathname),
    dt: d.title
  };
  const f = new FormData();
  for (let [k, v] of Object.entries(o)) {
    f.append(k, v);
  }
  try {
    await fetch('https://blog.tomayac.com/collect.php', {
      method: 'post',
      body: f
    });
  } catch {
    // Nothing
  }
})(Math.random, localStorage, screen, document, document.documentElement,
    encodeURIComponent, location, navigator, 'cid', 0);
