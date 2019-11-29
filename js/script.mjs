import './dark-mode-toggle.min.mjs';

const darkModeToggle = document.querySelector('dark-mode-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const root = document.documentElement;

darkModeToggle.addEventListener('colorschemechange', () => {
  themeColor.content = getComputedStyle(root).getPropertyValue('--background-color');
});
themeColor.content = getComputedStyle(root).getPropertyValue('--background-color');
