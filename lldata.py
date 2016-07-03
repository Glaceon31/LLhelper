# -*- coding: utf-8 -*-
from app import *
import json
import re

@app.route("/llsongdata")
def llsongdata():
    songsjson = open('newsongsjson.txt', 'rb').read()
    return render_template('llsongdata.html', songsjson = songsjson)

@app.route('/llsongrank')
def llsongrank():
    songsjson = open('songsjson.txt', 'rb').read()
    songsdiff = {}
    for i in range(9, 12):
        rank = open('result'+str(i)+'.txt', 'r').read().split('\n')
        for song in rank:
            info = song.split('\t')
            #print info
            if len(info) == 3:
                if info[0] == '无效请留空':
                    continue
                songsdiff[info[0]] = [i+string.atof(info[1])/10, round(string.atof(info[2])/10, 2)]
    songsdiff2= sorted(songsdiff.iteritems(), key=lambda d:d[1], reverse = True)
    songsdiff = []
    for i in songsdiff2:
        #print i[0]
        songsdiff.append([i[0].decode('utf-8'),i[1]])
    #print songsdiff
    return render_template('llsongrank.html', songsdiff = json.dumps(songsdiff), songsjson = songsjson)

@app.route("/llcarddata")
def llcarddata():
    #print open('newcardsjson.txt', 'rb').read()
    cardsjson = open('newcardsjson.txt', 'rb').read()
    #print cardsjson['1']['cardpluspath']
    return render_template('llcarddata.html', cardsjson = cardsjson)

@app.route("/llcardladder")
def llcardladder():
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template('llcardladder.html', cardsjson = cardsjson)

@app.route("/llaccardrank")
def llaccardrank():
    #print open('newcardsjson.txt', 'rb').read()
    cardsjson = open('newcardsjson.txt', 'rb').read()
    #print cardsjson['1']['cardpluspath']
    return render_template('llaccardrank.html', cardsjson = cardsjson)

@app.route("/lleventdata")
def lleventdata():
    eventdata = open('eventdata.txt', 'rb').read()
    return eventdata