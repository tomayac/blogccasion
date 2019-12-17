export const render = (entry) => {
  (($) => {
    $('.performance-metrics').hidden = false;
    switch (entry.type) {
      case 'lcp':
        const lcp = $('.lcp');
        if (!lcp.hidden) {
          return;
        }
        lcp.hidden = false;
        const lcpElement =  $('.lcp-element');
        lcpElement.textContent = `${/([^>]*)/.exec(entry.element.outerHTML)[0]}>`;
        $('.lcp-link').onclick = function () {
          entry.element.classList.toggle('largest-contentful-paint');
        };
        $('.lcp-time').textContent = (entry.value / 1000).toFixed(3);
        break;
      case 'fid':
        const fid = $('.fid');
        if (!fid.hidden) {
          return;
        }
        fid.hidden = false;
        $('.fid-type').textContent = entry.name;
        $('.fid-duration').textContent = (entry.value / 1000).toFixed(3);
        break;
      case 'cls':
        const cls = $('.cls');
        if (!cls.hidden) {
          return;
        }
        cls.hidden = false;
        $('.cls-score').textContent = entry.value.toFixed(3);
        break;
    }
  })(document.querySelector.bind(document));
};
