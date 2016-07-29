#!/bin/bash

# nodejs index.js
cp -R build/* ./gingerbear.github.io/movies
cd ./gingerbear.github.io/
git add .
export NOW=`date +"%Y-%m-%dT%H:%M:%SZ"`
git commit -am "update movies data $NOW"
git push origin master
