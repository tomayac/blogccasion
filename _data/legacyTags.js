// URLs this blog used to serve, and the tag each one means today.
//
// History, not current state: the keys are frozen. Adding a tag never belongs
// here, because a tag invented today never had one of these URLs. Renaming a
// tag does: move the value, so the old URL keeps pointing somewhere real. The
// build fails if a value names a tag that no longer exists.

export default {
  // Categories of the PHP blog (2005-2016), reached as
  // `/ViewByCategories.php?category=<key>`. Recovered from the tags on
  // pre-2016 posts as they stood before commit b6e400a4 expanded the
  // taxonomy, which is the last point at which tags still mirrored the old
  // blog's categories.
  categories: {
    'Browser Extensions': 'Browser Extensions',
    Conference: 'Conference',
    Erasmus: 'Erasmus',
    Life: 'Life',
    'Open Source': 'Open Source',
    Political: 'Political',
    Research: 'Research',
    'Semantic Web': 'Semantic Web',
    Technical: 'Technical',
    Work: 'Work',
  },

  // Tag pages as they were before slugs replaced plain lowercasing on
  // 2026-09-10, reached as `/tags/<key>/`. Only tags whose name does not
  // lowercase to its slug ever had a different URL.
  tagUrls: {
    'browser extensions': 'Browser Extensions',
    'command line': 'Command Line',
    'cross-origin storage': 'Cross-Origin Storage',
    'dark mode': 'Dark Mode',
    'home automation': 'Home Automation',
    'machine learning': 'Machine Learning',
    'microsoft edge': 'Microsoft Edge',
    'mini apps': 'Mini Apps',
    'node.js': 'Node.js',
    'open source': 'Open Source',
    'project fugu': 'Project Fugu',
    'semantic web': 'Semantic Web',
    'service workers': 'Service Workers',
    'transformers.js': 'Transformers.js',
    'web standards': 'Web Standards',
  },
};
