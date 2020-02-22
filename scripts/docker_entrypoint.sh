#!/bin/bash

mkdir -p logs
exec "$@" >logs/rocket.log 2>&1
