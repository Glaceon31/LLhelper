# -*- coding: utf-8 -*-
#import sae.kvdb
#from sae.storage import Bucket
from flask import Flask, render_template, redirect, session, request, send_file
import string
import random
import json
import sys
from lldata import LLData, LLDataMix

reload(sys)
sys.setdefaultencoding('utf-8')

app = Flask(__name__)
app.secret_key = "hatsune miku"

# file check interval: 60 seconds (only check when a request comes in and have not checked for 1 minute)
# auto reload the data during file check when file last modify time is changed
g_llcarddata = LLData('newcardsjson.txt', 60)
g_llsongdata = LLData('newsongsjson.txt', 60)
# snapshot for older card data, should have much less chance to update
g_llcarddata_cn = LLData('newcardsjson-20181021.txt', 3600)
g_llcarddata_mix = LLDataMix([g_llcarddata_cn, g_llcarddata], 'cn-mix', 60)


### activity ###
@app.route("/activitypt")
def activitypt():
       return render_template("activitypt.html")

@app.route("/llactivity", methods=['GET', 'POST'])
def llactivity():
    return render_template('llactivity.html')

@app.route("/llrally", methods=['GET', 'POST'])
def llrally():
    return render_template('llrally.html')

@app.route("/smmulti")
def smmulti():
       return render_template("smmulti.html")

@app.route("/llsm", methods=['GET', 'POST'])
def llsm():
    return render_template('llscorematch.html')

@app.route("/llmf", methods=['GET', 'POST'])
def llmf():
    return render_template('llmedleyfestival.html')

@app.route("/llcf", methods=['GET', 'POST'])
def llcf():
    return render_template('llchallengefestival.html')

@app.route("/llnm", methods=['GET', 'POST'])
def llnm():
    return render_template('llnakayoshi.html')

@app.route("/mfpt", methods=['GET', 'POST'])
def mfpt():
    return render_template('mfpt.html')

@app.route("/cfpt", methods=['GET', 'POST'])
def cfpt():
    return render_template('cfpt.html')

@app.route("/nmpt", methods=['GET', 'POST'])
def nmpt():
    return render_template('nmpt.html')

### data ###
@app.route("/llsongdata")
def llsongdata():
    return render_template('llsongdata.html')

@app.route("/llcoverage")
def llcoverage():
    return render_template('llcoverage.html')

@app.route("/llnewcarddata")
def llnewcarddata():
    return render_template('llnewcarddata.html')

@app.route("/llurcardrank")
def llurcardrank():
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template('llurcardrank.html', cardsjson = cardsjson)

@app.route("/lldata/cardbrief", methods=['GET'])
def lldata_cardbrief():
    if request.args['version'] == 'cn':
        return json.dumps(g_llcarddata_cn.queryByKeys(request.args['keys']))
    elif request.args['version'] == 'mix':
        return json.dumps(g_llcarddata_mix.queryByKeys(request.args['keys']))
    else:
        return json.dumps(g_llcarddata.queryByKeys(request.args['keys']))

@app.route("/lldata/card/<index>", methods=['GET'])
def lldata_carddetail(index):
    if request.args['version'] == 'cn':
        return json.dumps(g_llcarddata_cn.queryByIndex(index))
    elif request.args['version'] == 'mix':
        return json.dumps(g_llcarddata_mix.queryByIndex(index))
    else:
        return json.dumps(g_llcarddata.queryByIndex(index))

@app.route("/lldata/songbrief", methods=['GET'])
def lldata_songbrief():
    return json.dumps(g_llsongdata.queryByKeys(request.args['keys']))

@app.route("/lldata/song/<index>", methods=['GET'])
def lldata_songdetail(index):
    return json.dumps(g_llsongdata.queryByIndex(index))

### data api ###
@app.route("/llcardapiwiki")
def llcardapi():
       return open("cardsjson.txt").read()

@app.route("/llmapapiwiki")
def llmapapi():
       return open("songsjson.txt").read()

@app.route("/document")
def document():
    return send_file("document.txt")

### species ###
@app.route("/llspecies", methods=['GET', 'POST'])
@app.route("/llurrank", methods=['GET', 'POST'])
def urrank():
    return render_template("llurrank.html")

### level up ###
@app.route("/lllvlup", methods=['GET', 'POST'])
def lllvlup():
    return render_template("lllvlup.html")

### mainpage ###
@app.route("/", methods=['GET', 'POST'])
def hello():
    return render_template('mainpage.html')

@app.route("/about")
def about():
    return render_template('about.html')

@app.route("/releasenotes")
def releasenotes():
    return render_template('releasenotes.html')

from legacy_app import legacy_app

app.register_blueprint(legacy_app, url_prefix="/legacy")

from llunit import *
from lldatamodify import *

def development_test():
    return render_template('test.html')

# require Flask >= v1.0
if app.debug == True:
    app.add_url_rule('/test', 'development_test', development_test)

if __name__ == "__main__":
    import os
    if os.environ['LLHELPER_RUN_PORT']:
        app.run(port=int(os.environ['LLHELPER_RUN_PORT']))
    else:
        app.run()
