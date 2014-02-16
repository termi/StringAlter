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

cd ../..
tar czf string-alter.tgz string-alter && rm -rf string-alter
