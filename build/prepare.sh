#!/bin/sh
cd ..

rm -rf build/npm
mkdir build/npm

git archive master -o build/npm/string-alter.tar --prefix=string-alter/

cd build/npm

tar xf string-alter.tar && rm string-alter.tar

cd string-alter
rm .gitignore

cd build
./build.sh

cd ..

rm -rf src
rm -rf lib
rm -rf test
mv build/es5 es5
rm -rf build
mkdir build
mv es5 build/es5

cd ..

tar czf string-alter.tgz string-alter && rm -rf string-alter
