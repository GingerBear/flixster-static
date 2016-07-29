#!/bin/bash
pwd
cd /root/projects/flixster-static/
nodejs index.js
pwd
cp -R build/* /root/projects/gingerbear.github.io/movies
pwd
cd /root/projects/gingerbear.github.io/
pwd
git add .
git commit -am "update movies data by cron"
git push origin master
