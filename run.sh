#!/bin/bash

node index.js
cp -R build/* /Users/guanxiongding/Projects/gingerbear.github.io/movies
cd /Users/guanxiongding/Projects/gingerbear.github.io/
git add .
export NOW=`date +"%Y-%m-%dT%H:%M:%SZ"`
git commit -am "update movies data $NOW"
git push origin master