# find /tmp/puppeteer* -mtime +1 -exec rm -rf {} \;
cd
cd ./Documents/blogccasion
PATH=$PATH:/home/$(whoami)/.nvm/versions/node/$(ls /home/$(whoami)/.nvm/versions/node)/bin/
git stash save --keep-index && git stash drop
git fetch --all
git reset --hard origin/main
npm install
npm i pagefind @pagefind/linux-x64
npm run clean
npm run build
# npm run screenshots
cp -R ./_site/ /var/www/html/
rm -rf /var/www/html/blogccasion
mv /var/www/html/_site /var/www/html/blogccasion
npm run webmentions
