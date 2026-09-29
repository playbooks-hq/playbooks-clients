#!/bin/bash

if [ -z "$1" ]; then
  echo -e " \n please include a version. \n"
  exit
fi

echo -e "\n deploying updates... \n"

echo -e "\n npm version \n"
npm version $1

echo -e "\n npm build \n"
npm run build & build_id=$!
wait $build_id
if [ $? -eq 1 ]; then exit; fi

echo -e "\n npm publish \n"
npm publish --access public
if [ $? -ne 0 ]; then echo "Publish failed"; exit 1; fi

echo -e "\n git push tags \n"
git push --tags & push_id=$!
wait $push_id
if [ $? -eq 1 ]; then exit; fi

echo -e "\n git push \n"
git push & push_id=$!
wait $push_id
if [ $? -eq 1 ]; then exit; fi

echo -e "\n deploy finished. \n"
