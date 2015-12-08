# -*- coding: utf-8 -*-
import urllib2
import json
import re
import string

eventtype = ['classic', 'score match', 'medley festival']
character = ['honoka', 'kotori', 'umi', 'nozomi', 'eli', 'nico', 'rin', 'hanayo', 'maki']
last = [0,1,2,3,4,5,6,7,8,
        [[68534,69499,70409,72298],[49616,50181,50795,52138]],10,
        [[69436,70723,72131,74520],[46497,47007,47551,48836]],
        [[20119,20330,20610,21267],[14761,14980,15255,15881]],
        [[53685,54145,54805,56416],[42198,42727,43256,44523]],
        [[27612,28131,28720,30009],[18810,19179,19618,20468]],
        [[60478,61188,62022,63467],[46927,47495,48204,49605]],
        [[29432,30005,30570,31531],[21187,21621,22258,23134]],
        [[60569,61587,62805,64436],[46971,47804,48937,50549]],
        [[24209,24480,24770,25431],[17505,17833,18258,19200]],
        [[62256,63230,64289,66206],[49429,50278,51100,53045]],
        [[30636,31033,31582,32946],[21119,21558,22154,23317]],
        [[79479,80833,82045,84599],[55852,56769,57872,60120]],
        [[22235,22422,22648,23314],[15790,16022,16263,16848]],
        [[61411,61972,62727,64352],[45345,45795,46382,47802]],
        [[21111,21407,21741,22484],[15757,16097,16418,17271]],
        [[55282,55708,56471,57962],[41924,42463,43152,44416]],
        [[25415,25771,26396,27323],[18934,19376,19989,20947]],
        [[60482,61302,61984,63433],[46243,46878,47675,48968]],
        [[29256,30028,30703,32074],[20309,20897,21632,22735]],
        [[64057,64915,66099,68044],[47698,48519,49550,51108]],
        [[25766,26031,26311,26987],[18150,18520,19059,20108]],
        [[53720,54300,54900,56472],[42041,42665,43282,44725]],
        [[20106,20269,20486,21063],[13682,13866,14090,14598]],
        [[59475,60034,60443,61952],[47954,48539,49229,50922]],
        [[22752,0,0,24123],[16947,0,0,18223]],
        [[55180,0,0,56931],[44845,0,0,47478]]]


content = urllib2.urlopen('http://www.lovelivewiki.com/w/EventCutOff').read()
#content = open('111.htm', 'r').read()

eventdatare = re.compile('<table id="eventData" border="1">[\s\S]*?</table>')
eventdata = eventdatare.findall(content)[0].decode('utf-8')

trre = re.compile('<tr>([\s\S]*?)</tr>')
trredata = trre.findall(eventdata)

print len(trredata)
print trredata[len(trredata)-1]

result = {}

for i in range(6, len(trredata)/4):
    if i == 7:
        continue
    tdre = re.compile('<td>(.*?)</td>')
    info = tdre.findall(trredata[4*i+1])
    firstrank = tdre.findall(trredata[4*i+2])
    secondrank = tdre.findall(trredata[4*i+3])
    del firstrank[0]
    del secondrank[0]
    event = {}
    event['id'] = i+3
    event['character'] = character[string.atoi(info[2])]
    event['days'] = string.atoi(info[1])
    event['type'] = eventtype[string.atoi(info[6])]
    fscore = [string.atoi(s) for s in firstrank]
    sscore = [string.atoi(s) for s in secondrank]
    event['score'] = [fscore,sscore]
    if len(last)-3 > i:
        if type(last[event['id']]) != int:
            if len(sscore) == 2*event['days']:
                for j in last[event['id']][0]:
                    event['score'][0].insert(-1, j)
                for j in last[event['id']][1]:
                    event['score'][1].insert(-1, j)
            else:
                for j in last[event['id']][0]:
                    event['score'][0].append(j)
                for j in last[event['id']][1]:
                    event['score'][1].append(j)
    result[event['id']] = event
    print i,event

output = open('score.txt', 'wb')
output.write(json.dumps(result))
output.close()

