#!/bin/sh
echo "beginning StringAlter transiling"
rm -rf es5
mkdir es5

declare -a main=(StringAlter.js)
for i in ${main[@]}
do
  echo "building $i"
  node --harmony es6toes5 ../src/$i es5/$i
done

# TODO: tests
# echo "running tests (in es5 mode i.e. without --harmony)"
# /usr/bin/env node run-tests.js --path ../../tests

echo "done self-build. Press Enter"
