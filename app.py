# -*- coding: utf-8 -*-
#import sae.kvdb
#from sae.storage import Bucket
from flask import Flask, render_template, redirect, session, request, send_file
import string
import random
import json

app = Flask(__name__)
app.secret_key = "hatsune miku"
app.debug = True

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
    songsjson = open('newsongsjson.txt', 'rb').read()
    return render_template('llsongdata.html', songsjson = songsjson)

@app.route("/llcoverage")
def llcoverage():
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template('llcoverage.html', cardsjson = cardsjson)

@app.route("/llnewcarddata")
def llnewcarddata():
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template('llnewcarddata.html', cardsjson = cardsjson)

@app.route("/llurcardrank")
def llurcardrank():
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template('llurcardrank.html', cardsjson = cardsjson)

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

from llunit import *
from lldatamodify import *

if __name__ == "__main__":
    app.run()



