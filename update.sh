#!/bin/bash

do_download_livedb=
do_download_unitdb=
do_cleanup=
livedb=livenewjp.db_
unitdb=unitnewjp.db_

if [ "$1" = "local" ]; then
  if [ ! -f "$livedb" ]; then
    do_download_livedb=y
  fi
  if [ ! -f "$unitdb" ]; then
    do_download_unitdb=y
  fi
else
  do_download_livedb=y
  do_download_unitdb=y
  do_cleanup=y
fi

if [ "$do_download_livedb" = "y" ]; then
  wget -O $livedb https://r.llsif.win/db/live/live.db_
fi
if [ "$do_download_unitdb" = "y" ]; then
  wget -O $unitdb https://r.llsif.win/db/unit/unit.db_
fi

python2 updatenewcard.py
python2 updatenewlive.py
python2 updateweight_sync.py

if [ "$do_cleanup" = "y" ]; then
  rm $livedb
  rm $unitdb
fi

