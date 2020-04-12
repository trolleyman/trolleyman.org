#!/bin/bash

mkdir -p logs
exec "$@" >logs/facebook_grpc.log 2>&1
