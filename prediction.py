# -*- coding: utf-8 -*-
import json
import string
import argparse

eventData = json.loads(open('score.txt', 'rb').read())
#eventData['47']['score'][0][-1] -= 500
#eventData['47']['score'][1][-1] -= 1000
bad = [27,32,47]

def classicchange(scorearray, days, proportion):
    total_afterex = scorearray[-1]-scorearray[-14]
    average_afterex = total_afterex/4.5
    average_beforeex = scorearray[-14]/(days-4.5)
    multi_before = (scorearray[-14]+(average_afterex-average_beforeex)*proportion*4.5)/scorearray[-14]
    multi_after = (average_afterex-(average_afterex-average_beforeex)*proportion)/average_afterex
    result = []
    
    for i in xrange(0,len(scorearray)):
        if i <= (2*days-10):
            result.append(int(scorearray[i]*multi_before))
        else:
            result.append(int(result[i-1]+(scorearray[i]-scorearray[i-1])*multi_after))

    #print offset
    
    return result

def eventequal(type1,type2):
    if type1 == 'classic' and type2 == 'classic':
        return True
    if (type1 == 'score match' or type1 == 'medley festival') and\
    (type2 == 'score match' or type2 == 'medley festival'):
        return True
    return False

def daychange(scorearray, olddays, days, type):
    result = scorearray
    deltaarray = [scorearray[i]-scorearray[i-2] for i in range(2,len(scorearray)-5)]
    delta2array = [deltaarray[i]-deltaarray[i-1] for i in range(1,len(deltaarray))]
    mindelta2 = 100000
    minpos = 0
    typebase = 4
    if type == 'classic':
    	typebase = 10
    for i in range(4, len(delta2array)-typebase):
        delta2 = int(1.5*abs(delta2array[i]))+abs(delta2array[i+1])+int(0.5*abs(delta2array[i+2]))
        if delta2 < mindelta2:
            minpos = i
            mindelta2 = delta2
    #print olddays, days,len(scorearray),len(deltaarray),len(delta2array)
    offset = deltaarray[minpos+1]
    if days == olddays+1:
        result.insert(minpos+4, scorearray[minpos+2]+offset)
        result.insert(minpos+5, scorearray[minpos+3]+offset)
        for i in range(minpos+6, len(result)):
            result[i] += offset
    elif days == olddays-1:
    	del result[minpos+3]
    	del result[minpos+3]
    	for i in range(minpos+3, len(result)):
    		result[i] -= offset
    return result

def calcusimilarity(eventid1, eventid2, pos):
    #print eventid1,eventid2,pos
    #print eventData[str(eventid1)]
    distance = [1,1]
    #eventid1n = string.atoi(eventid1)
    #eventid2n = string.atoi(eventid2)
    for i in range(0,pos+1):
        #print i
        if (eventData[str(eventid1)]['type'] == 'medley festival') and (eventData[str(eventid1)]['type'] != eventData[str(eventid2)]['type']):
        #print i,eventData[str(eventid1)]['score'][0][i],eventData[str(eventid2)]['score'][0][i]
            #print 'sm'
            distance[0] = 0.8*distance[0]+1.1**abs(eventid1-eventid2)*abs(eventData[str(eventid1)]['score'][0][i]/1.167-eventData[str(eventid2)]['score'][0][i]+100)**2
            distance[1] = 0.8*distance[1]+1.1**abs(eventid1-eventid2)*abs(eventData[str(eventid1)]['score'][1][i]/1.167-eventData[str(eventid2)]['score'][1][i]+100)**2
        else:
            distance[0] = 0.8*distance[0]+1.1**abs(eventid1-eventid2)*abs(eventData[str(eventid1)]['score'][0][i]-eventData[str(eventid2)]['score'][0][i]+100)**2
            distance[1] = 0.8*distance[1]+1.1**abs(eventid1-eventid2)*abs(eventData[str(eventid1)]['score'][1][i]-eventData[str(eventid2)]['score'][1][i]+100)**2
    #print distance[1]
    if eventData[str(eventid1)]['type'] != eventData[str(eventid2)]['type']:
        distance[0]*=10
        distance[1]*=10
    return [1.0/(distance[0]/10000000.0),1.0/(distance[1]/10000000.0)]

def predict(eventid, pos, change):
    predictevent = eventData[str(eventid)]
    totalweight = [0,0]
    totalpredict = [0,0]
    current = [predictevent['score'][0][pos],predictevent['score'][1][pos]]
    if pos > 1:
        currentdelta = [current[0]-predictevent['score'][0][pos-2],current[1]-predictevent['score'][1][pos-2]]
    else:
        currentdelta = [1,1]
    for index in eventData:
        if string.atoi(index) in bad:
            continue
    	event = eventData[index]
        if event['id'] < eventid and abs(event['days']-predictevent['days']) <= 1 \
        and eventequal(event['type'],predictevent['type']):
            if abs(event['days']-predictevent['days']) == 1 and change:
                event['score'][0] = daychange(event['score'][0],event['days'],predictevent['days'],predictevent['type'])
                event['score'][1] = daychange(event['score'][1],event['days'],predictevent['days'],predictevent['type'])
                event['days'] = predictevent['days']
            if event['type'] == 'classic' and event['id'] <=45 and change:
                event['score'][0] = classicchange(event['score'][0],event['days'],0.15)
                event['score'][1] = classicchange(event['score'][1],event['days'],0.15)
            event['predict'] = [0]*2
            if args.old:
                event['weight'] = [1.0, 1.0]
            else:
                event['weight'] = calcusimilarity(eventid,string.atoi(index),pos)#[1.0,1.0]
                if abs(event['days']-predictevent['days']) == 1:
                    event['weight'][0] *= 0.5
                    event['weight'][1] *= 0.5
            
            if pos >1 and args.delta:
                delta0 = event['score'][0][pos]-event['score'][0][pos-2]
                delta1 = event['score'][1][pos]-event['score'][1][pos-2]
                event['predict'][0] = current[0]+int(1.0*(event['score'][0][-1]-event['score'][0][pos])*currentdelta[0]/delta0)
                event['predict'][1] = current[1]+int(1.0*(event['score'][1][-1]-event['score'][1][pos])*currentdelta[1]/delta1)
            else:
                event['predict'][0] = int(1.0*event['score'][0][-1]*(1.0*current[0]/event['score'][0][pos]))
                event['predict'][1] = int(1.0*event['score'][1][-1]*(1.0*current[1]/event['score'][1][pos]))
            totalpredict[0] += event['weight'][0]*event['predict'][0]
            totalpredict[1] += event['weight'][1]*event['predict'][1]
            totalweight[0] += event['weight'][0]
            totalweight[1] += event['weight'][1]
            if not args.all or pos == len(eventData[args.eventid]['score'][0])-1:
            	print event['id'], event['character'],event['predict'], event['weight']
    print int(totalpredict[0]/totalweight[0]), int(totalpredict[1]/totalweight[1])
    notchange = False
    return [int(totalpredict[0]/totalweight[0]), int(totalpredict[1]/totalweight[1])]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('eventid')
    parser.add_argument('-a', '--all', action='store_true')
    parser.add_argument('-o', '--old', action='store_true')
    parser.add_argument('-d', '--delta', action='store_true')
    parser.add_argument('pos')
    args = parser.parse_args()
    change = True
    if args.all:
        for i in range(0, len(eventData[args.eventid]['score'][0])):
            predict(string.atoi(args.eventid), i, change)
            change = False
    else:
        predict(string.atoi(args.eventid), string.atoi(args.pos), True)