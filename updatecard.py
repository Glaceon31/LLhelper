# -*- coding: utf-8 -*-
import json
import os
import hashlib
import sqlite3
import re

cards = json.loads(open('newcardsjson.txt', 'rb').read())
avatarpath = 'static//llhead'
cardpath = 'static//card'
navipath = 'static//navi'
smallcardpath = 'static//card300'
imgsource = 'http://i1.tietuku.com/'
imgsource3 = 'http://i3.tietuku.com/'
imgsource4 = 'http://i4.tietuku.com/'
jpdbpath = 'unitjp.db_'
cndbpath = 'unitcn.db_'
navirepo = 'http://app.lovelivewiki.com/images/navis/'


def tothree(cardid):
    result = str(cardid)
    while len(result) < 3:
        result = '0'+result
    return result

def threetonumber(cardid):
    result = str(cardid)
    while result[0] == '0':
        result = result[1:len(result)]
    return result

attribute = ['','smile', 'pure', 'cool', '', 'all']
rarity = ['','N','R','SR','UR']

def namechange(name):
    if name == u"南琴梨":
        return u"南小鸟"
    elif name == u"矢泽日香":
        return u"矢泽妮可"
    else:
        return name

if __name__ == "__main__":
    jpdbconn = sqlite3.connect(jpdbpath)
    cndbconn = sqlite3.connect(cndbpath)
    jptc = jpdbconn.execute('SELECT * FROM unit_m;')
    jptmp = jptc.fetchone()
    #cntc = cndbconn.execute('SELECT * FROM unit_m;')
    #cntmp = cntc.fetchone()
    while jptmp:#[0] < 30:
        if not cards.has_key(str(jptmp[1])):
            cards[str(jptmp[1])] = {}
            card = cards[str(jptmp[1])]
            card['cnhave'] = 0
            card['series'] = ''
            card['jpseries'] = ''
            card['type'] = u'卡池卡'
        card = cards[str(jptmp[1])]
        card['id'] = jptmp[1]
        cncard = cndbconn.execute('SELECT * FROM unit_m WHERE unit_number = '+str(jptmp[1])+';')
        cntmp = cncard.fetchone()
        card['rarity'] = rarity[jptmp[17]]
        card['attribute'] = attribute[jptmp[18]]
        card['eponym'] = jptmp[3]
        card['jpeponym'] = jptmp[3]
        card['name'] = jptmp[4]
        card['jpname'] = jptmp[4]
        card['hp'] =  jptmp[32]-1
        card['smile2'] = jptmp[33]
        card['pure2'] = jptmp[34]
        card['cool2'] = jptmp[35]
        card['smile'] =  0
        card['pure'] = 0
        card['cool'] = 0
        card['skill'] = jptmp[20]
        card['Cskill'] = jptmp[23]
        card['support'] = 0
        card['special'] = 0

        #card['type'] = ''
        card['Cskillattribute'] = card['attribute']
        card['Cskillpercentage'] = 0

        if cntmp:
            card['eponym'] = cntmp[3]
            card['name'] = namechange(cntmp[4])
        if jptmp[30] > 0:
            card['support'] = 1
        if jptmp[15] == jptmp[16] and card['support'] == 0:
            card['special'] = 1
        if card['support'] == 0 and card['special'] == 0:
            patterntmp = jpdbconn.execute('SELECT * FROM unit_level_up_pattern_m WHERE unit_level_up_pattern_id = '+str(jptmp[31])+' AND unit_level = '+str(jptmp[28])+';')
            tmp = patterntmp.fetchone()
            card['smile'] = card['smile2']-tmp[4]
            card['pure'] = card['pure2']-tmp[5]
            card['cool'] = card['cool2']-tmp[6]
        #skill
        
        if jptmp[20]:
            jpskilltmp = jpdbconn.execute('SELECT * FROM unit_skill_m WHERE unit_skill_id = '+str(jptmp[20])+';')
            jpskill = jpskilltmp.fetchone()
            card['jpskillname'] = jpskill[1]
            #cnskilltmp = cndbconn.execute('SELECT * FROM unit_skill_m WHERE unit_skill_id = '+str(jptmp[20])+';')
            #cnskill = cnskilltmp.fetchone()
            card['skillname'] = jpskill[1]
            card['skilleffect'] = jpskill[4]
            card['triggertype'] = jpskill[6]
            skilldetail = jpdbconn.execute('SELECT * FROM unit_skill_level_m WHERE unit_skill_id = '+str(jptmp[20])+';')
            card['skilldetail'] = []
            if cntmp:
                cnskilltmp = cndbconn.execute('SELECT * FROM unit_skill_m WHERE unit_skill_id = '+str(jptmp[20])+';')
                cnskill = cnskilltmp.fetchone()
                card['skillname'] = cnskill[1]
            for i in range(0, 8):
                tmp = skilldetail.fetchone()
                card['skilldetail'].append({})
                if card['skilleffect'] == 4 or card['skilleffect'] == 5:
                    card['skilldetail'][i]['score'] = tmp[5]
                else:
                    card['skilldetail'][i]['score'] = tmp[4]
                card['skilldetail'][i]['require'] = tmp[6]
                card['skilldetail'][i]['possibility'] = tmp[7]
        #leader skill
        if jptmp[23]:
            if jptmp[23] <= 9:
                card['Cskillattribute'] = card['attribute']
                card['Cskillpercentage'] = 3*((jptmp[23]-1)%3)+3
            else:
            	base = ['pure', 'cool', 'smile','cool', 'smile','pure']
                card['Cskillattribute'] = base[jptmp[23]-31]
                card['Cskillpercentage'] = 12

        #image
        if jptmp[15] != jptmp[16]:
            try:
                '''
                avatarfile = open(avatarpath+'//head'+tothree(card['id'])+'.png', 'rb').read()
                m = hashlib.md5()
                m.update(avatarfile)
                if card['id'] <=629 or (card['id'] >= 638 and card['id'] <= 650) or (card['id'] >= 660 and card['id'] <= 661):
                    card['avatarpath'] = imgsource+m.hexdigest()[8:24]+'.png'
                elif card['id'] >= 651:
                    card['avatarpath'] = imgsource3+m.hexdigest()[8:24]+'.png'
                else:
                    card['avatarpath'] = imgsource4+m.hexdigest()[8:24]+'.png'
                '''
                card['cardpath'] = 'http://app.lovelivewiki.com/images/cards/'+str(jptmp[15])+'.png'#imgsource+cm.hexdigest()[8:24]+'.png'
                card['avatarpath'] = 'http://app.lovelivewiki.com/images/llhead/head'+tothree(card['id'])+'.png'
                '''
                cardfile = open(cardpath+'//card'+tothree(card['id'])+'.png', 'rb').read()
                cm = hashlib.md5()
                cm.update(cardfile)
                scardfile = open(smallcardpath+'//card'+tothree(card['id'])+'.png', 'rb').read()
                scm = hashlib.md5()
                scm.update(scardfile)
                '''
                card['smallcardpath'] = ''#imgsource+scm.hexdigest()[8:24]+'.png'
                
            except:
                print 'fail: '+str(card['id'])
                card['cardpath'] = ''
                card['smallcardpath'] = ''
            card['navipath'] = navirepo+'navi'+tothree(str(jptmp[1]))+'.png'
        else:
            card['avatarpath'] = '' 
            card['cardpath'] = '' 
            card['smallcardpath'] = ''
        try:
            '''
            plusfile = open(avatarpath+'//headplus'+tothree(card['id'])+'.png', 'rb').read()
            m2 = hashlib.md5()
            m2.update(plusfile)
            if card['id'] <=629 or (card['id'] >= 638 and card['id'] <= 650) or (card['id'] >= 660 and card['id'] <= 661):
                card['avatarpluspath'] = imgsource+m2.hexdigest()[8:24]+'.png'
            elif card['id'] >= 651:
                card['avatarpluspath'] = imgsource3+m2.hexdigest()[8:24]+'.png'
            else:
                card['avatarpluspath'] = imgsource4+m2.hexdigest()[8:24]+'.png'
            '''
            card['avatarpluspath'] = 'http://app.lovelivewiki.com/images/llhead/headplus'+tothree(card['id'])+'.png'
            card['cardpluspath'] = 'http://app.lovelivewiki.com/images/cards/'+str(jptmp[16])+'.png'#imgsource+cm2.hexdigest()[8:24]+'.png'
            '''
            plusfile = open(cardpath+'//cardplus'+tothree(card['id'])+'.png', 'rb').read()
            cm2 = hashlib.md5()
            cm2.update(plusfile)
            
            splusfile = open(smallcardpath+'//cardplus'+tothree(card['id'])+'.png', 'rb').read()
            scm2 = hashlib.md5()
            scm2.update(splusfile)
            '''
            card['smallcardpluspath'] = ''#imgsource+scm2.hexdigest()[8:24]+'.png'
        except:
            print 'failplus: '+str(card['id'])
            card['cardpluspath'] = ''
            card['smallcardpluspath'] = ''
        card['navipluspath'] = navirepo+'naviplus'+tothree(str(jptmp[1]))+'.png'
        '''
        #dangerous
        if card['id'] <= 332 and card['special'] == 0:
            card['cnhave'] = 1
        else:
            card['cnhave'] = 0
        #
        '''
        jptmp = jptc.fetchone()

    #dangerous code
    '''
    oldcards = json.loads(open('cardsjson.txt', 'rb').read())
    for oldcard in oldcards:
        cards[threetonumber(str(oldcard['id']))]['cnhave'] = oldcard['cnhave']
        cards[threetonumber(str(oldcard['id']))]['type'] = oldcard['type']

        sre = re.compile('\((.*?)\)')
        cards[threetonumber(str(oldcard['id']))]['series'] = sre.findall(oldcard['name'])
        cards[threetonumber(str(oldcard['id']))]['jpseries'] = sre.findall(oldcard['jpname'])
    '''
    #
    


    output = open('newcardsjson.txt', 'wb')
    output.write(json.dumps(cards))
    output.close()




    
