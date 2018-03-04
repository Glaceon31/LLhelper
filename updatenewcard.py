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
jpdbpath = 'unitnewjp.db_'
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
rarity = ['','N','R','SR','UR','SSR']

def namechange(name):
    if name == u"南琴梨":
        return u"南小鸟"
    elif name == u"矢泽日香":
        return u"矢泽妮可"
    else:
        return name

if __name__ == "__main__":
    jpdbconn = sqlite3.connect(jpdbpath)
    has_cndb = os.path.exists(cndbpath)
    if has_cndb:
        cndbconn = sqlite3.connect(cndbpath)
    jptc = jpdbconn.execute('SELECT * FROM unit_m;')
    jptmp = jptc.fetchone()
    #cntc = cndbconn.execute('SELECT * FROM unit_m;')
    #cntmp = cntc.fetchone()
    while jptmp:#[0] < 30:
        print jptmp[1]
        if not cards.has_key(str(jptmp[1])):
            cards[str(jptmp[1])] = {}
            card = cards[str(jptmp[1])]
            card['cnhave'] = 0
            card['series'] = ''
            card['jpseries'] = ''
            card['type'] = u'卡池卡'
        skillid = jptmp[13]
        card = cards[str(jptmp[1])]
        card['id'] = jptmp[1]
        if has_cndb:
            cncard = cndbconn.execute('SELECT * FROM unit_m WHERE unit_number = '+str(jptmp[1])+';')
            cntmp = cncard.fetchone()
        else:
            cntmp = 0
        card['rarity'] = rarity[jptmp[11]]
        card['attribute'] = attribute[jptmp[12]]
        card['jpeponym'] = jptmp[3]
        card['jpname'] = jptmp[4]
        # do not overwrite old data
        if not card.has_key('eponym'):
            card['eponym'] = jptmp[3]
        if not card.has_key('name'):
            card['name'] = jptmp[4]
        card['hp'] =  jptmp[24]-1
        card['smile2'] = jptmp[25]
        card['pure2'] = jptmp[26]
        card['cool2'] = jptmp[27]
        card['smile'] =  0
        card['pure'] = 0
        card['cool'] = 0
        card['skill'] = skillid
        card['Cskill'] = jptmp[15]
        card['support'] = 0
        card['special'] = 0
        card['minslot'] = jptmp[20]
        card['maxslot'] = jptmp[21]

        #card['type'] = ''
        card['Cskillattribute'] = card['attribute']
        card['Cskillpercentage'] = 0

        if cntmp:
            card['eponym'] = cntmp[3]
            card['name'] = namechange(cntmp[4])
        if jptmp[22] > 0:
            card['support'] = 1
        if jptmp[5] == jptmp[6] and card['support'] == 0:
            card['special'] = 1
        if card['support'] == 0 and card['special'] == 0:
            patterntmp = jpdbconn.execute('SELECT * FROM unit_level_up_pattern_m WHERE unit_level_up_pattern_id = '+str(jptmp[23])+' AND unit_level = '+str(jptmp[18])+';')
            tmp = patterntmp.fetchone()
            card['smile'] = card['smile2']-tmp[4]
            card['pure'] = card['pure2']-tmp[5]
            card['cool'] = card['cool2']-tmp[6]
        #skill
        
        if skillid and card['support'] == 0:
            jpskilltmp = jpdbconn.execute('SELECT * FROM unit_skill_m WHERE unit_skill_id = '+str(skillid)+';')
            jpskill = jpskilltmp.fetchone()
            card['jpskillname'] = jpskill[1]
            #cnskilltmp = cndbconn.execute('SELECT * FROM unit_skill_m WHERE unit_skill_id = '+str(jptmp[20])+';')
            #cnskill = cnskilltmp.fetchone()
            # do not overwrite old data
            if not card.has_key('skillname'):
                card['skillname'] = jpskill[1]
            card['skilleffect'] = jpskill[4]
            card['triggertype'] = jpskill[6]
            if cntmp:
                cnskilltmp = cndbconn.execute('SELECT * FROM unit_skill_m WHERE unit_skill_id = '+str(skillid)+';')
                cnskill = cnskilltmp.fetchone()
                card['skillname'] = cnskill[1]
            # skill detailed effect for each level
            skilldetail = jpdbconn.execute('SELECT effect_value,discharge_time,trigger_value,activation_rate FROM unit_skill_level_m WHERE unit_skill_id = '+str(skillid)+' ORDER BY skill_level ASC;')
            card['skilldetail'] = []
            for i in range(0, 8):
                tmp = skilldetail.fetchone()
                card['skilldetail'].append({})
                card['skilldetail'][i]['score'] = tmp[0]
                card['skilldetail'][i]['time'] = tmp[1]
                card['skilldetail'][i]['require'] = tmp[2]
                card['skilldetail'][i]['possibility'] = tmp[3]
            triggertarget = jpdbconn.execute('SELECT trigger_target FROM unit_skill_trigger_target_m WHERE unit_skill_id = '+str(skillid)+' ORDER BY trigger_target DESC;')
            tmp = triggertarget.fetchone()
            if tmp:
                card['triggertarget'] = []
                while tmp:
                    card['triggertarget'].append(tmp[0])
                    tmp = triggertarget.fetchone()
            effecttarget = jpdbconn.execute('SELECT effect_target FROM unit_skill_effect_target_m WHERE unit_skill_id = '+str(skillid)+' ORDER BY effect_target DESC;')
            tmp = effecttarget.fetchone()
            if tmp:
                card['effecttarget'] = []
                while tmp:
                    card['effecttarget'].append(tmp[0])
                    tmp = effecttarget.fetchone()
        #leader skill
        if jptmp[15]:
            Cskilldetail = jpdbconn.execute('SELECT * FROM unit_leader_skill_m WHERE unit_leader_skill_id = '+str(jptmp[15])+';')
            cskill = Cskilldetail.fetchone()
            base =['','smile','pure','cool']
            card['Cskillpercentage'] = cskill[5]
            #print cskill
            if cskill[5] == 12:
                card['Cskillattribute'] = base[(cskill[3]/10)%10]
            else:
                card['Cskillattribute'] = base[cskill[3]%10]
            Csecondskilldetail = jpdbconn.execute('SELECT * FROM unit_leader_skill_extra_m WHERE unit_leader_skill_id = '+str(jptmp[15])+';')
            csecondskill = Csecondskilldetail.fetchone()
            if csecondskill:
                card['Csecondskillattribute'] = csecondskill[3]
                card['Csecondskilllimit'] = csecondskill[1]

        for delkey in ['cardpath','avatarpath','smallcardpath','navipath','cardpluspath','avatarpluspath','smallcardpluspath','navipluspath']:
            if card.has_key(delkey):
                del card[delkey]
        
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
    output.write(json.dumps(cards, sort_keys=True))
    output.close()




    
