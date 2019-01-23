const fs = require('fs');

posts = fs.readFileSync('old_posts.backup', {encoding: 'utf8'});

posts.split(/\n*FICKEN FICKEN FICKEN\n*/gm).forEach(post => {
  const year = post.replace(/[\s\S]*^date:\s"(\d\d\d\d)-(\d\d)-(\d\d)T[\s\S]*/gm, '$1');
  const month = post.replace(/[\s\S]*^date:\s"(\d\d\d\d)-(\d\d)-(\d\d)T[\s\S]*/gm, '$2');
  const day = post.replace(/[\s\S]*^date:\s"(\d\d\d\d)-(\d\d)-(\d\d)T[\s\S]*/gm, '$3');
  const time = post.replace(/[\s\S]*^date:\s"(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)[\s\S]*/gm, '$4$5$6');
  const slug = post.replace(/[\s\S]*slug:\s"(.*?)"$[\s\S]*/gm, '$1');
  post = post.replace(/title:\s(.*?)$/gm, 'layout: layouts/post.njk\ntitle: $1')
  post = post.replace(/slug:\s(.*?)$/gm, 'permalink: ' + year + '/' + month + '/' + day + '/' + slug + '-' + time + '/index.html')
  /*
  try {fs.mkdirSync(year)}catch(e){}
  try {fs.mkdirSync(year + '/' + month)}catch(e){}
  try {fs.mkdirSync(year + '/' + month + '/' + day)}catch(e){}
  try {fs.mkdirSync(year + '/' + month + '/' + day + '/' + slug)}catch(e){}
  */
  fs.writeFileSync('posts/' +  year + '-' + month + '-' + day + '_' + slug + '.html', post);
})