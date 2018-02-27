from app import *
from flask import make_response
import json


@app.route("/llsaveunit/<content>", methods=['GET', 'POST'])
def llunitsave(content):
    '''
    int_element = ["smile", "pure", "cool", "kizuna", "skill", "require", "possibility"]
    float_element = ["score"]
    for i in range(0, 9):
        for key in int_element:
            member[i][key] = string.atoi(request.form.get(key+str(i)))
        for key in float_element:
            member[i][key] = string.atof(request.form.get(key+str(i)))
        member[i]["main"] = request.form.get("main"+str(i))
    '''
    response = make_response(content)
    response.headers['Content-Type'] = 'application/octet-stream'
    response.headers['Content-Disposition'] = 'attachment; filename=unit.sd'
    return response

@app.route("/llsavesis/<content>", methods=['GET', 'POST'])
def llsavesis(content):
    response = make_response(content)
    response.headers['Content-Type']='application/octet-stream'
    response.headers['Content-Disposition']='attachment; filename=idolskills.sd'
    return response

@app.route("/llsavesubmembers/<content>", methods=['GET', 'POST'])
def llsubmemberssave(content):
    response = make_response(content)
    response.headers['Content-Type']='application/octet-stream'
    response.headers['Content-Disposition']='attachment; filename=submembers.sd'
    return response

@app.route("/llsaveallmembers/<content>", methods=['GET', 'POST'])
def llsaveallmembers(content):
    response = make_response(content)
    response.headers['Content-Type']='application/octet-stream'
    response.headers['Content-Disposition']='attachment; filename=submembers.sd'
    return response

@app.route("/llload/<callback>", methods=['GET', 'POST'])
def llload(callback):
    print request.files, callback
    for f in request.files['file']:
        return '<script>' + callback + '(' + f.replace('%7B', '{').replace('%22', '"').replace('%7D', '}').replace('%5B', '[').replace('%5D', ']') + ');</script>'

@app.route("/llloadnewsubmemberssis", methods=['GET', 'POST'])
def llnewsubmembersload():
    print request.files
    for f in request.files['filesub']:
        f = f.replace('%7B', '{').replace('%22', '"').replace('%7D', '}').replace('%5B', '[').replace('%5D', ']')
        #print f
        memberinfo = json.loads(f)
        print memberinfo[0]
        script = 'parent.submember=[];\n'
        attlist = ['cardid','mezame','skilllevel','maxcost']
        for i in range(0, len(memberinfo)):
            if len(memberinfo[i])==15:
                continue
            script = script+'parent.submember['+str(i)+']={}\n'
            for j in attlist:
                script = script+'parent.submember['+str(i)+']["'+j+'"]='+memberinfo[i][j]+';\n'
        script = script+'parent.getsubmembersdata();\n'
        return '<script>'+script+'</script>'


@app.route("/llloadunit", methods=['GET', 'POST'])
def llunitload():
    print request.files
    for f in request.files['file']:
        f = f.replace('%7B', '{').replace('%22', '"').replace('%7D', '}').replace('%5B', '[').replace('%5D', ']')
        # print f
        memberinfo = json.loads(f)
        print memberinfo[0]
        script = ''
        attlist = ['smile', 'pure', 'cool', 'kizuna', 'skill', \
                   'require', 'possibility', 'score', 'cardid', 'mezame']
        for i in range(0, 9):
            for j in attlist:
                script = script + 'parent.document.getElementById("' + j + str(i) + '").value="' + str(
                    memberinfo[i][j]) + '";\n'
            script = script + 'parent.document.getElementById("main' + str(
                i) + '").value= parent.cards[parent.cardidtoindex("' + str(memberinfo[i]['cardid']) + '")].attribute;\n'
            script = script + 'parent.changeskilltext(' + str(i) + ');parent.changeavatar(' + str(i) + ');\n'
            script = script + 'parent.document.getElementById("skilllevel' + str(
                i) + '").value= parent.getskilllevel(' + str(i) + ');\n'
        script = script + 'parent.changecenter();parent.precalcu();\n'
        return '<script>' + script + '</script>'


@app.route("/llloadnewunit-api", methods=['POST'])
def llnewunitload_api():
    memberinfo = request.json
    script = ''
    attlist = ['smile', 'pure', 'cool', 'skilllevel', 'cardid', 'mezame',
               'gemnum', 'gemsinglepercent', 'gemallpercent', 'gemskill', 'gemacc']
    for i in range(0, 9):
        for j in attlist:
            script = script + 'document.getElementById("' + j + str(i) + '").value="' + str(
                memberinfo[i][j]) + '";\n'
        script = script + 'document.getElementById("main' + str(
            i) + '").value= cards[parent.cardidtoindex("' + str(memberinfo[i]['cardid']) + '")].attribute;\n'
        script = script + 'changeavatar(' + str(i) + ');calslot(' + str(i) + ');\n'
    script = script + 'changecenter();precalcu();\n'
    return script


def genllunitloadscript(json_str, sis=False):
    json_str = json_str.replace('%7B', '{').replace('%22', '"').replace('%7D', '}').replace('%5B', '[').replace('%5D', ']')
    memberinfo = json.loads(json_str)
    script = ''
    attlist = ['smile', 'pure', 'cool', 'skilllevel', 'cardid', 'mezame', \
               'gemnum', 'gemsinglepercent', 'gemallpercent', 'gemskill', 'gemacc','maxcost']
    sisattset = {'maxcost'}
    for i in range(0, 9):
        for j in attlist:
            if not sis and j in sisattset:
                continue
            if j in memberinfo[i]:
                script = script+'parent.document.getElementById("'+j+str(i)+'").value="'+str(memberinfo[i][j])+'";\n'
            else:
                script = script+'parent.document.getElementById("'+j+str(i)+'").value="'+str(0)+'";\n'
        script = script+'parent.document.getElementById("main'+str(i)+'").value= parent.cards[parent.cardidtoindex("'+str(memberinfo[i]['cardid'])+'")].attribute;\n'
        script = script+'parent.changeavatar('+str(i)+');parent.calslot('+str(i)+');\n'
    script = script+'parent.changecenter();parent.precalcu();\n'
    if sis and len(memberinfo)>9:
        for i in range(1,16):
            if str(i) in memberinfo[9]:
                script = script+'parent.sisrecord['+str(i)+']='+str(memberinfo[9][str(i)])+';\n'
                print memberinfo[9][str(i)]
            else:
                script = script+'parent.sisrecord['+str(i)+']='+str(0)+';\n'
        script =script+'parent.autoarm();\n'
    return script

@app.route("/llloadnewunit", methods=['GET', 'POST'])
def llnewunitload():
    print request.files
    for f in request.files['file']:
        return '<script>'+genllunitloadscript(f)+'</script>'


@app.route("/llloadnewunitsis", methods=['GET', 'POST'])
def llnewunitloadsis():
    print request.files
    for f in request.files['file']:
        return '<script>'+genllunitloadscript(f, sis=True)+'</script>'

@app.route("/llloadsis", methods=['GET', 'POST'])
def llnewsis():
    print("=====!==")
    print request.files
    for f in request.files['filesis']:
        f = f.replace('%7B', '{').replace('%22', '"').replace('%7D', '}').replace('%5B', '[').replace('%5D', ']')
        
        print("=====!==")

        memberinfo = json.loads(f)
        print memberinfo
        script = ''
        attlist = ['smile', 'pure', 'cool', 'skilllevel', 'cardid', 'mezame', \
                   'gemnum', 'gemsinglepercent', 'gemallpercent', 'gemskill', 'gemacc', 'maxcost']
        for i in range(0, 9):
            for j in attlist:
                if j in memberinfo[i]:
                    script = script + 'parent.document.getElementById("' + j + str(i) + '").value="' + str(
                        memberinfo[i][j]) + '";\n'
                else:
                    script = script + 'parent.document.getElementById("' + j + str(i) + '").value="' + str(0) + '";\n'
            script = script + 'parent.document.getElementById("main' + str(
                i) + '").value= parent.cards[parent.cardidtoindex("' + str(memberinfo[i]['cardid']) + '")].attribute;\n'
            script = script + 'parent.changeavatar(' + str(i) + ');parent.calslot(' + str(i) + ');\n'
            # script = script+'parent.changeskilltext('+str(i)+');parent.changeavatar('+str(i)+');\n'
            # script = script+'parent.document.getElementById("skilllevel'+str(i)+'").value= parent.getskilllevel('+str(i)+');\n'
        script = script + 'parent.changecenter();parent.precalcu();\n'
        return '<script>' + script + '</script>'

@app.route("/llunit", methods=['GET', 'POST'])
def llunit():
    songsjson = open('newsongsjson.txt', 'rb').read()
    cardsjson = open('oldcardsjson.txt', 'rb').read()
    result = {}
    int_element = ["smile", "pure", "cool", "kizuna", "skill", "require", "possibility"]
    float_element = ["weight", "score"]
    sel_element = ['base', 'base2', 'bonus', 'bonus2', 'map']
    sel_int = ['percentage', 'percentage2', 'combo', 'perfect', 'star', 'starperfect', 'time']
    sel_float = ['slider']
    atts = ['smile', 'pure', 'cool']
    result['calculate'] = 0
    if request.form.has_key('submit'):
        member = [{}, {}, {}, {}, {}, {}, {}, {}, {}]
        mapcenter = {}
        result['baseatt'] = {}
        result['bonusatt'] = {}
        for att in atts:
            result['baseatt'][att] = 0
            result['bonusatt'][att] = 0
        for key in sel_int:
            mapcenter[key] = string.atoi(request.form.get(key))
        for key in sel_float:
            mapcenter[key] = string.atof(request.form.get(key))
        for key in sel_element:
            mapcenter[key] = request.form.get(key)
        for i in range(0, 9):
            for key in int_element:
                member[i][key] = string.atoi(request.form.get(key + str(i)))
            for key in float_element:
                member[i][key] = string.atof(request.form.get(key + str(i)))
            member[i]["main"] = request.form.get("main" + str(i))
            # print member[i]
            for att in atts:
                result['baseatt'][att] += member[i][att]
                if att == member[i]['main']:
                    result['bonusatt'][att] += member[i]['kizuna']
        # c
        result['bonusatt'][mapcenter['bonus']] += mapcenter['percentage'] * result['baseatt'][mapcenter['base']] / 100.0
        result['bonusatt'][mapcenter['bonus2']] += mapcenter['percentage2'] * result['baseatt'][
            mapcenter['base2']] / 100.0
        result['bonusatt'][mapcenter['bonus2']] = int(round(result['bonusatt'][mapcenter['bonus2']]))
        result['calculate'] = 1
        showatt = result['bonusatt'][mapcenter['map']] + result['baseatt'][mapcenter['map']]
        combomulti = ll.cbmulti(mapcenter['combo'])
        accmulti = 0.88 + 0.12 * mapcenter['perfect'] / mapcenter['combo']
        #
        result['minscore'] = 0
        for i in range(0, 9):
            result['minscore'] += int(showatt / 80.0 * member[i]['weight'] * combomulti * accmulti * (
            1 + 0.1 * (mapcenter['map'] == member[i]['main'])))
        #
        result['maxscore'] = result['minscore']
        result['averagescore'] = result['minscore']
        result['averageheal'] = 0
        result['maxheal'] = 0
        result['accuracy'] = 0
        skillchance = [0] * 9
        averageskillscore = [0] * 9
        # except score scoring
        for i in range(0, 9):
            skill = member[i]['skill']
            if skill == 1 or skill == 11:
                skillchance[i] = mapcenter['combo'] / member[i]['require']
                result['maxscore'] += mapcenter['combo'] / member[i]['require'] * member[i]['score']
                averageskillscore[i] = mapcenter['combo'] / member[i]['require'] * member[i]['possibility'] * member[i][
                    'score'] / 100
                result['averagescore'] += mapcenter['combo'] / member[i]['require'] * member[i]['possibility'] * \
                                          member[i]['score'] / 100
            if skill == 2:
                skillchance[i] = mapcenter['perfect'] / member[i]['require']
                result['maxscore'] += mapcenter['perfect'] / member[i]['require'] * member[i]['score']
                averageskillscore[i] = mapcenter['perfect'] / member[i]['require'] * member[i]['possibility'] * \
                                       member[i]['score'] / 100
                result['averagescore'] += mapcenter['perfect'] / member[i]['require'] * member[i]['possibility'] * \
                                          member[i]['score'] / 100
            if skill == 4:
                skillchance[i] = mapcenter['time'] / member[i]['require']
                result['maxscore'] += mapcenter['time'] / member[i]['require'] * member[i]['score']
                averageskillscore[i] = mapcenter['time'] / member[i]['require'] * member[i]['possibility'] * member[i][
                    'score'] / 100
                result['averagescore'] += mapcenter['time'] / member[i]['require'] * member[i]['possibility'] * \
                                          member[i]['score'] / 100
            if skill == 7 or skill == 13:
                skillchance[i] = mapcenter['combo'] / member[i]['require']
                result['maxheal'] += mapcenter['combo'] / member[i]['require'] * member[i]['score']
                result['averageheal'] += mapcenter['combo'] / member[i]['require'] * member[i]['possibility'] * \
                                         member[i]['score'] / 100
            if skill == 8:
                skillchance[i] = mapcenter['time'] / member[i]['require']
                result['maxheal'] += mapcenter['time'] / member[i]['require'] * member[i]['score']
                result['averageheal'] += mapcenter['time'] / member[i]['require'] * member[i]['possibility'] * \
                                         member[i]['score'] / 100
            if skill == 9:
                skillchance[i] = mapcenter['perfect'] / member[i]['require']
                result['maxheal'] += mapcenter['perfect'] / member[i]['require'] * member[i]['score']
                result['averageheal'] += mapcenter['perfect'] / member[i]['require'] * member[i]['possibility'] * \
                                         member[i]['score'] / 100
            if skill == 10:
                skillchance[i] = mapcenter['starperfect'] / member[i]['require']
                result['maxscore'] += mapcenter['starperfect'] / member[i]['require'] * member[i]['score']
                averageskillscore[i] = mapcenter['starperfect'] / member[i]['require'] * member[i]['possibility'] * \
                                       member[i]['score'] / 100
                result['averagescore'] += mapcenter['starperfect'] / member[i]['require'] * member[i]['possibility'] * \
                                          member[i]['score'] / 100
        # score scoring
        finish = False
        infinite = False
        averagescoringtimes = [0] * 9
        maxscoringtimes = [0] * 9
        while not finish:
            finish = True
            for i in range(0, 9):
                if member[i]['skill'] == 3 and averagescoringtimes[i] < int(
                                result['averagescore'] / member[i]['require']):
                    remaintimes = int(result['averagescore'] / member[i]['require']) - averagescoringtimes[i]
                    averagescoringtimes[i] += remaintimes
                    averageskillscore[i] += remaintimes * member[i]['possibility'] * member[i]['score'] / 100
                    result['averagescore'] += remaintimes * member[i]['possibility'] * member[i]['score'] / 100
                    finish = False
                if not finish and result['averagescore'] > 10000000:
                    result['averagescore'] = '1000w+'
                    infinite = True
                    finish = True
                    break
        if not infinite:
            result['averagescore'] = int(result['averagescore'])
        finish = False
        infinite = False
        while not finish:
            finish = True
            for i in range(0, 9):
                if member[i]['skill'] == 3 and maxscoringtimes[i] < int(result['maxscore'] / member[i]['require']):
                    remaintimes = int(result['maxscore'] / member[i]['require']) - maxscoringtimes[i]
                    maxscoringtimes[i] += remaintimes
                    result['maxscore'] += remaintimes * member[i]['score']
                    finish = False
            if not finish and result['maxscore'] > 10000000:
                result['maxscore'] = '1000w+'
                infinite = True
                finish = True
                break
        if not infinite:
            result['maxscore'] = int(result['maxscore'])

        # simulation

        times = 10000
        simresult = [0] * times
        for t in range(0, times):
            nowscore = result['minscore']
            for i in range(0, 9):
                skill = member[i]['skill']
                if skill == 1 or skill == 2 or skill == 4 or skill == 10 or skill == 11:
                    for j in range(0, skillchance[i]):
                        if random.random() < member[i]['possibility'] / 100.0:
                            nowscore += member[i]['score']

            finish = False
            scoringtimes = [0] * 9
            while not finish:
                finish = True
                for i in range(0, 9):
                    skill = member[i]['skill']
                    if skill == 3 and scoringtimes[i] < int(nowscore / member[i]['require']):
                        remaintimes = int(nowscore / member[i]['require']) - scoringtimes[i]
                        scoringtimes[i] += remaintimes
                        for j in range(0, remaintimes):
                            if random.random() < member[i]['possibility'] / 100.0:
                                nowscore += member[i]['score']
                                finish = False

            simresult[t] = nowscore
        simresult.sort(reverse=True)
        if result['averagescore'] != 'impossible':
            result['unitstrength'] = int(result['averagescore'] * 1.0 / result['minscore'] * showatt)
            result['singlestrength'] = [0] * 9
            for i in range(0, 9):
                result['singlestrength'][i] = member[i][mapcenter['map']]
                if mapcenter['bonus'] == mapcenter['map']:
                    result['singlestrength'][i] += member[i][mapcenter['base']] * mapcenter['percentage'] / 100.0
                if mapcenter['bonus2'] == mapcenter['map']:
                    result['singlestrength'][i] += member[i][mapcenter['base2']] * mapcenter['percentage2'] / 100.0
                result['singlestrength'][i] += int(averageskillscore[i] * 1.0 / result['minscore'] * showatt)
                if member[i]['main'] != mapcenter['map']:
                    result['unitstrength'] -= int(
                        showatt * member[i]['weight'] / 11.0 / mapcenter['combo'] / (1 + 0.0025 * mapcenter['slider']))
                    result['singlestrength'][i] -= int(
                        showatt * member[i]['weight'] / 11.0 / mapcenter['combo'] / (1 + 0.0025 * mapcenter['slider']))
                else:
                    result['singlestrength'][i] += member[i]['kizuna']
                result['singlestrength'][i] = int(result['singlestrength'][i])
        # print simresult
        result['simresult'] = {1: simresult[times / 100], 2: simresult[times / 50], 5: simresult[times / 20],
                               10: simresult[times / 10], \
                               20: simresult[times / 5], 30: simresult[times * 3 / 10], 40: simresult[times * 4 / 10],
                               50: simresult[times / 2], \
                               60: simresult[times * 6 / 10], 70: simresult[times * 7 / 10],
                               80: simresult[times * 8 / 10], 90: simresult[times * 9 / 10], \
                               95: simresult[times * 95 / 100], 98: simresult[times * 98 / 100],
                               99: simresult[times * 99 / 100]}

    return render_template("llunit.html", data=result, cardsjson=cardsjson, songsjson=songsjson)


@app.route("/llnewunit", methods=['GET', 'POST'])
def llnewunit():
    argv = request.args.get("unit")
    addon = ""
    if argv:
        try:
            addon = genllunitloadscript(argv)
        except BaseException:
            pass
    songsjson = open('newsongsjson.txt', 'rb').read()
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template("llnewunit.html", cardsjson = cardsjson, songsjson = songsjson, additional_script=addon)

@app.route("/llnewunitsis", methods=['GET', 'POST'])
def llnewunitsis():
    argv = request.args.get("unit")
    addon = ""
    if argv:
        try:
            addon = genllunitloadscript(argv)
        except BaseException:
            pass
    songsjson = open('newsongsjson.txt', 'rb').read()
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template("llnewunitsis.html", cardsjson = cardsjson, songsjson = songsjson, additional_script=addon)

@app.route("/llnewautounit", methods=['GET', 'POST'])
def llnewautounit():
    songsjson = open('newsongsjson.txt', 'rb').read()
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template("llnewautounit.html", cardsjson = cardsjson, songsjson = songsjson)

@app.route("/llnewunit40", methods=['GET', 'POST'])
def llnewunit40():
    songsjson = open('newsongsjson.txt', 'rb').read()
    cardsjson = open('newcardsjson4.txt', 'rb').read()
    return render_template("llnewunit40.html", cardsjson = cardsjson, songsjson = songsjson)

@app.route("/llunitimport", methods=['GET', 'POST'])
def llunitimport():
    return render_template("llunitimport.html")
