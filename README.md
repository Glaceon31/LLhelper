LLHelper
========

## How to Use

### Install requirements
```sh
pip install -r requirements.txt
```

### Run on Development Environment
```sh
FLASK_APP=app.py FLASK_ENV=development python2 -m flask run
```

### Run on Production Environment
```sh
FLASK_APP=app.py FLASK_RUN_PORT={PORT} python2 -m flask run
```

## Test
* llnewunit, llnewunitsis, llnewautounit, llnewcarddata, llcoverage
  * filter member, select member, put member
  * change skill level
  * calculate, calculate with sis, calculate with submembers
  * refresh after calculate
  * load unit, save unit
  * clear input
  * change language
* llunitimport link to llnewunit/llnewunitsis
  ```
  /llnewunitsis?unit=[{%22smile%22:6340,%22pure%22:4240,%22cool%22:4320,%22cardid%22:955,%22skilllevel%22:4,%22mezame%22:1,%22gemnum%22:0,%22gemsinglepercent%22:0,%22gemallpercent%22:0,%22gemskill%22:1,%22gemacc%22:0,%22maxcost%22:4},{%22smile%22:3850,%22pure%22:5220,%22cool%22:3580,%22cardid%22:976,%22skilllevel%22:2,%22mezame%22:1,%22gemnum%22:0,%22gemsinglepercent%22:0,%22gemallpercent%22:0.024,%22gemskill%22:0,%22gemacc%22:0,%22maxcost%22:4},{%22smile%22:3940,%22pure%22:5310,%22cool%22:3430,%22cardid%22:960,%22skilllevel%22:2,%22mezame%22:1,%22gemnum%22:200,%22gemsinglepercent%22:0,%22gemallpercent%22:0.018,%22gemskill%22:0,%22gemacc%22:0,%22maxcost%22:4},{%22smile%22:3210,%22pure%22:5390,%22cool%22:4180,%22cardid%22:932,%22skilllevel%22:2,%22mezame%22:1,%22gemnum%22:0,%22gemsinglepercent%22:0,%22gemallpercent%22:0.024,%22gemskill%22:0,%22gemacc%22:0,%22maxcost%22:4},{%22smile%22:4440,%22pure%22:6380,%22cool%22:4090,%22cardid%22:1007,%22skilllevel%22:3,%22mezame%22:1,%22gemnum%22:0,%22gemsinglepercent%22:0,%22gemallpercent%22:0,%22gemskill%22:1,%22gemacc%22:0,%22maxcost%22:4},{%22smile%22:3230,%22pure%22:5380,%22cool%22:4170,%22cardid%22:1014,%22skilllevel%22:2,%22mezame%22:1,%22gemnum%22:0,%22gemsinglepercent%22:0,%22gemallpercent%22:0.024,%22gemskill%22:0,%22gemacc%22:0,%22maxcost%22:4},{%22smile%22:3210,%22pure%22:5460,%22cool%22:4200,%22cardid%22:1038,%22skilllevel%22:2,%22mezame%22:1,%22gemnum%22:0,%22gemsinglepercent%22:0.16,%22gemallpercent%22:0,%22gemskill%22:0,%22gemacc%22:0,%22maxcost%22:3},{%22smile%22:3570,%22pure%22:5180,%22cool%22:3910,%22cardid%22:999,%22skilllevel%22:2,%22mezame%22:1,%22gemnum%22:200,%22gemsinglepercent%22:0,%22gemallpercent%22:0.018,%22gemskill%22:0,%22gemacc%22:0,%22maxcost%22:4},{%22smile%22:4230,%22pure%22:5500,%22cool%22:3740,%22cardid%22:675,%22skilllevel%22:1,%22mezame%22:0,%22gemnum%22:0,%22gemsinglepercent%22:0,%22gemallpercent%22:0.024,%22gemskill%22:0,%22gemacc%22:0,%22maxcost%22:4}]
  ```
