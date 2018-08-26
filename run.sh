#!/bin/sh

if [ "$1" != "" ]; then
    echo "Run in production mode with port $1"
    FLASK_APP=app.py FLASK_RUN_PORT=$1 python2 -m flask run
else
    echo "Run in development mode"
    FLASK_APP=app.py FLASK_ENV=development python2 -m flask run
fi;

