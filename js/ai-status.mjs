// SPDX-FileCopyrightText: 2026 Thomas Steiner
//
// SPDX-License-Identifier: Apache-2.0

/**
 * The footer note about which of the page's AI features are actually running.
 * The two are independent, so the note is assembled from whichever of them
 * reports in, and stays hidden when neither does.
 *
 * Each module announces itself rather than the footer feature-detecting them,
 * because support and use are not the same thing: the search tools only exist
 * on the two pages that carry the search, registration can fail, and the ask
 * box retracts itself if the model turns out not to work after all.
 */

/**
 * @param {string} feature The suffix of the reporting item's class, so
 *   `webmcp` for `.ai-webmcp`.
 * @param {boolean} active Whether that feature is running on this page.
 */
const announce = (feature, active) => {
  const note = document.querySelector('.ai-status');
  const item = note?.querySelector(`.ai-${feature}`);
  if (!item) {
    return;
  }
  item.hidden = !active;

  // One sentence built from two halves, so the conjunction joining them only
  // earns its place when both are actually there, and the line itself only
  // when at least one is.
  const running = (name) => !note.querySelector(`.ai-${name}`).hidden;
  const prompt = running('prompt');
  const webmcp = running('webmcp');
  note.querySelector('.ai-and').hidden = !(prompt && webmcp);
  note.hidden = !(prompt || webmcp);
};

export { announce };
