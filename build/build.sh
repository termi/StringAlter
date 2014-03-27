#!/bin/sh
./clean.sh

mkdir es5
mkdir npm
# mkdir test

node --harmony build.js

# ./test.sh
# TODO: tests
# echo "running tests (in es5 mode i.e. without --harmony)"
# /usr/bin/env node run-tests.js --path ../../tests
