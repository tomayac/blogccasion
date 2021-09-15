cd
cd ./Documents/blogccasion
PATH=$PATH:/home/tsteiner/.nvm/versions/node/$(ls /home/tsteiner/.nvm/versions/node)/bin/
git stash save --keep-index && git stash drop
git pull
npm install
npm run clean
npm run build
npm run screenshots
cp -R ./_site/ /var/www/html/
rm -rf /var/www/html/blogccasion
mv /var/www/html/_site /var/www/html/blogccasion
npm run webmentions
