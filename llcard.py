from app import *

@app.route("/llcardlist")
def llcardlist():
    return render_template("llcardlist.html")

@app.route("/llcardtest", methods=['GET', 'POST'])
def llcardtest():
    songsjson = open('songsjson.txt', 'rb').read()
    cardsjson = open('cardsjson.txt', 'rb').read()
    int_elements = ['smile', 'pure', 'cool', 'require','time', 'perfect', \
                    'total', 'totalequal', 'possibility',  'combo', 'kizuna', 'percentage',\
                    'percentage2', 'skill', 'star', 'starperfect']
    att_int = ['map', 'main', 'bonus', 'base', 'bonus2', 'base2']
    attint = {'smile': 0, 'pure': 1, 'cool': 2}
    float_elements = ['score', 'slider', 'position']
    calcu = ['finalscore', 'accuracy', 'heal', 'attribute', 'attributeo', \
            'showattribute', 'skillattribute', 'skillattributeshow','skillattributeo', 'cbonus',\
            'kizunabonus', 'colorbonus']
    session['llcard'] = {}
    result = {}
    result['calculate'] = 0
    if  request.form.has_key('submit'):
        for key in request.form:
            session['llcard'][key] = request.form.get(key)
        try:
            for key in int_elements:
                exec(key+'=string.atoi(session["llcard"]["'+key+'"])')
            for key in float_elements:
                exec(key+'=string.atof(session["llcard"]["'+key+'"])')
            for key in att_int:
                exec(key+'=session["llcard"]["'+key+'"]')
                exec(key+'=attint['+key+']')
            raw = [smile, pure, cool]
            rightc = rightc2 = rightmain = 0
            accuracy = 0
            heal = 0
            if map == bonus:
                rightc = 1
            if map == bonus2:
                rightc2 = 1
            if map == main:
                rightmain = 1
            attributeo = raw[map]
            kizunabonus = kizuna*rightmain
            cbonus = raw[base]*percentage/100*rightc+raw[base2]*percentage2/100*rightc2
            showattribute = raw[map]+raw[base]*percentage/100*rightc+raw[base2]*percentage2/100*rightc2+kizuna*rightmain
            attribute = showattribute
            multiplier = 80.0
            if main == map:
                attribute = int(showattribute+total*(0.1*position/(combo+0.25*combo*slider/100.0)))
                #multiplier = multiplier/(total*(0.1*position/combo)/attribute)
            colorbonus = int(total*(0.1*position/(combo+0.25*combo*slider/100.0)))*rightmain
            skillattribute = 0
            skillattributeo = 0
            skillattributeshow = 0
            cbmulti = ll.cbmulti(combo)
            multiplier = multiplier/(1+0.25*slider/100)/cbmulti/(0.88+0.12*perfect/combo)
            if skill == 1 or skill == 11:
                score_singal = 1.0*score*possibility/100*(combo/require)/combo     
                skillattribute = int(score_singal*multiplier)
                attribute = attribute+skillattribute
            elif skill == 2:
                score_singal = 1.0*score*possibility/100*(perfect/require)/combo
                skillattribute = int(score_singal*multiplier)
                attribute = attribute+skillattribute
            elif skill == 3:
                skillattribute = int(totalequal*score*possibility/100/require)
                attribute = attribute+skillattribute
            elif skill == 4:
                score_singal = 1.0*score*possibility/100*(time/require)/combo
                skillattribute = int(score_singal*multiplier)
                attribute = attribute+skillattribute
            elif skill == 5:
                accuracytime = (time/require-1)*score*possibility/100.0+(time-time/require*require)*possibility/100.0
                accuracy = round(accuracytime/time*100, 1)
                morepf = (combo-perfect)*accuracy/100.0
                affectedattr = total*1.09*ll.cbmulti(combo)*(1+0.25*slider/100)
                skillattribute = int(affectedattr*(0.12*morepf/combo))
                attribute = attribute+skillattribute
            elif skill == 6 or skill == 12:
                accuracytime = (combo/require)*score*possibility/100.0
                accuracy = round(accuracytime/time*100, 1)
                morepf = (combo-perfect)*accuracy/100.0
                affectedattr = total*1.09*ll.cbmulti(combo)*(1+0.25*slider/100)
                skillattribute = int(affectedattr*(0.12*morepf/combo))                            
                attribute = attribute+skillattribute
            elif skill == 7 or skill == 13:
                heal = (combo/require)*score*possibility/100.0/combo
            elif skill == 8:
                heal = (time/require)*score*possibility/100.0/combo
            elif skill == 9:
                heal = (perfect/require)*score*possibility/100.0/combo
            elif skill == 10:
                score_singal = 1.0*score*possibility/100*(star/require)/combo     
                skillattribute = int(score_singal*multiplier)
                skillattributeo = int(skillattribute*attributeo/showattribute)
                attribute = attribute+skillattribute
            skillattributeshow = int(skillattribute*showattribute/attribute)
            skillattributeo = int(skillattribute*attributeo/attribute)
            heal = int(heal*10000)/10000.0
        finally:
            a = 1
        finalscore = int(totalequal/multiplier*combo)
        result['calculate'] = 1
        for key in calcu:
            exec('result["'+key+'"] = '+key)
    return render_template("llcardtest.html", data = result, cardsjson = cardsjson, songsjson = songsjson)
