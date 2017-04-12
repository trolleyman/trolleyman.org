#!/bin/bash
set -ex

pushd "$(dirname $BASH_SOURCE)" > /dev/null

rm -r static

popd > /dev/null
