#!/bin/bash
set -ex
curl -u "trolleyman" -D - -H "Accept: application/vnd.github.v3+json" -X POST https://api.github.com/repos/trolleyman/trolleyman.org/hooks/43672434/pings
