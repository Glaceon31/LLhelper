#!/bin/bash

wget -O livenewjp.db_ https://r.llsif.win//db/live/live.db_
wget -O unitnewjp.db_ https://r.llsif.win/db/unit/unit.db_
python2 updatenewcard.py
python2 updatenewlive.py
python2 updateweight_sync.py
rm livenewjp.db_
rm unitnewjp.db_

