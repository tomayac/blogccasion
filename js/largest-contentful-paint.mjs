export const render = (lcp, element) => {
  ((createElement, footerLink) => {
    const li = createElement('li');
    const before = createElement('a');
    before.href = 'https://web.dev/lcp';
    before.classList.add(footerLink);
    before.textContent = 'LCP';
    li.appendChild(before);
    let span = createElement('span');
    span.textContent = ' was ';
    li.appendChild(span);
    const link = createElement('a');
    link.classList.add(footerLink);
    const code = createElement('code');
    code.textContent = `${/([^>]*)/.exec(element.outerHTML)[0]}>`;
    link.appendChild(code);
    link.onclick = function () {
      element.classList.toggle('largest-contentful-paint');
    };
    li.appendChild(link);
    span = span.cloneNode();
    span.textContent = ` at ${(lcp / 1000).toFixed(2)}s.`;
    li.appendChild(span);
    const ul = document.querySelector('footer ul');
    ul.appendChild(li);
  })(document.createElement.bind(document), 'footer-link');
};
