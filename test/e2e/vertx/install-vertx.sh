#!/bin/bash
ARCHIVE="vert.x-3.2.0-full.tar.gz"
DIRECTORY="runtime"
[ -e ${ARCHIVE} ] || wget https://bintray.com/artifact/download/vertx/downloads/${ARCHIVE}
if [ ! -e ${DIRECTORY} ]; then
  mkdir ${DIRECTORY}; (cd ${DIRECTORY} && tar -zxf ../${ARCHIVE})
fi
