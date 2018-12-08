const fs = require('fs');

posts = fs.readFileSync('old_posts.backup', {encoding: 'utf8'});

posts.split(/\n*FICKEN FICKEN FICKEN\n*/gm).forEach(post => {
  const filename = 'posts/' + post.replace(/[\s\S]*slug:\s"(.*?)"$\n[\s\S]*/gm, '$1.html')
  post = post.replace(/title:\s(.*?)$/gm, 'layout: layouts/post.njk\ntitle: $1')
  console.log(filename)
  fs.writeFileSync(filename, post);
})