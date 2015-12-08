# -*- coding: utf-8 -*-
from app import *

@app.route("/llsongmodify", methods=['GET', 'POST'])
def llsongmodify():
    openfile = open('songsjson.txt', 'rb')
    songsjson = openfile.read()
    openfile.close()
    songs = json.loads(songsjson)
    if request.form.has_key('submit'):
        print request.form
        if request.form.get('passwd') == 'prpr' or True:
            pre = request.form.get('previoussong')
            if pre == "":
                pre = -1
            else:
                pre = string.atoi(pre)
            now = request.form.get('songchoice')
            if now == "":
                now = -1
            else:
                now = string.atoi(now)
            element = ['name', 'jpname', 'difficulty', 'attribute', 'stardifficulty','oldstardifficulty',  'randomdifficulty','oldrandomdifficulty', 'lp', 'exp',\
                        'combo','weight','slider', 'time','totaltime','bpm','cscore'\
                        ,'bscore','ascore','sscore','star','type','cnhave', 'sm', 'mf'\
                        ,'smsscore','smascore','smbscore','smcscore']
            list_element=['positionnote', 'positionslider','positionweight']
            newsong = {}
            for key in element:
                newsong[key] = request.form.get(key)
            for key in list_element:
                newsong[key] = ['']*9
                for i in range(0, 9):
                    newsong[key][i] = request.form.get(key+str(i))
            songs.insert(pre+1, newsong)
            if now != -1:
                if pre < now:
                    del songs[now+1]
                else:
                    del songs[now]
            newsongsjson = open('songsjson.txt','wb')
            newsongsjson.write(json.dumps(songs))
            newsongsjson.close()
            newsongsjs = open('.\\static\\llsongapi.js','wb')
            newsongsjs.write('function getsongjson(){return '+songsjson+'}')
            newsongsjs.close()
            return render_template('llsongmodify.html', songsjson = json.dumps(songs)) 
                     
    return render_template('llsongmodify.html', songsjson = songsjson)

@app.route("/llcardmodify", methods=['GET', 'POST'])
def llcardmodify():
    inputfile = open('newcardsjson.txt', 'rb')
    cardsjson = inputfile.read()
    inputfile.close()
    cards = json.loads(cardsjson)
    if request.form.has_key('submit'):
        print request.form
        if request.form.get('passwd') == 'prpr' or True:
            now = request.form.get('cardchoice')
            element = ['type' ,'cnhave', 'series', 'jpseries']
            for key in element:
                cards[now][key] = request.form.get(key)

            newcardsjson = open('newcardsjson.txt','wb')
            newcardsjson.write(json.dumps(cards))
            newcardsjson.close()
            newcardsjs = open('.\\static\\llcardapi.js','wb')
            newcardsjs.write('function getcardjson(){return '+cardsjson+'}')
            newcardsjs.close()
            return render_template('llcardmodify.html', cardsjson = json.dumps(cards)) 
                     
    return render_template('llcardmodify.html', cardsjson = cardsjson)

@app.route("/llnewsongmodify", methods=['GET', 'POST'])
def llnewsongmodify():
    openfile = open('newsongsjson.txt', 'rb')
    songsjson = openfile.read()
    openfile.close()
    songs = json.loads(songsjson)
    if request.form.has_key('submit'):
        print request.form
        if request.form.get('passwd') == 'prpr' or True:
            now = request.form.get('songchoice')
            diff = request.form.get('diffchoice')
            songelement = ['type' ,'name', 'bpm', 'totaltime']
            diffelement = ['oldstardifficulty', 'oldrandomdifficulty', 'lp', 'exp', 'time', 'sm', 'mf','star','cnhave']
            mfmodify = False
            if songs[now].has_key('expert'):
                if songs[now]['expert']['mf'] == songs[now]['hard']['mf']:
                    mfmodify = True
            for key in songelement:
                songs[now][key] = request.form.get(key)
            for key in diffelement:
                songs[now][diff][key] = request.form.get(key)
            if diff == 'expert':
                if mfmodify:
                    songs[now]['easy']['mf'] = request.form.get('mf')
                    songs[now]['normal']['mf'] = request.form.get('mf')
                    songs[now]['hard']['mf'] = request.form.get('mf')
            if diff == 'hard':
                songs[now]['easy']['sm'] = request.form.get('sm')
                songs[now]['normal']['sm'] = request.form.get('sm')
                songs[now]['easy']['mf'] = request.form.get('mf')
                songs[now]['normal']['mf'] = request.form.get('mf')
            for i in range(0, 9):
                songs[now][diff]['positionweight'][i] = request.form.get('positionweight'+str(i))
            newsongsjson = open('newsongsjson.txt','wb')
            newsongsjson.write(json.dumps(songs))
            newsongsjson.close()
            newsongsjs = open('.\\static\\llsongapi.js','wb')
            newsongsjs.write('function getsongjson(){return '+songsjson+'}')
            newsongsjs.close()
            return render_template('llnewsongmodify.html', songsjson = json.dumps(songs)) 
    return render_template('llnewsongmodify.html', songsjson = songsjson)