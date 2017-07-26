# -*- coding: utf-8 -*-
import json
import os
import hashlib
import sqlite3
import urllib2
import urllib
import re
import traceback

namechange = {}
namechange['愛してるばんざーい！']='愛してるばんざーい!'
namechange['もぎゅっと“love”で接近中！']='もぎゅっと"love"で接近中!'
namechange['告白日和、です！']='告白日和、です!'
namechange['キミのくせに！']='キミのくせに!'
namechange['好きですが好きですか？']='好きですが好きですか?'
namechange['君のこころは輝いてるかい？']='君のこころは輝いてるかい?'
#namechange['るてしキスキしてる']=''
#namechange['Shangri-La Shower']=''
#namechange['NO EXIT ORION']=''
namechange['さようならへさよなら！']='さようならへさよなら!'
namechange['愛は太陽じゃない？']='愛は太陽じゃない?'
namechange['まほうつかいはじめました！']='まほうつかいはじめました!'
namechange['Oh,Love＆Peace!']='Oh,Love&Peace!'
namechange['夜空はなんでも知ってるの？']='夜空はなんでも知ってるの?'
namechange['知らないLove＊教えてLove']='知らないLove*教えてLove'
namechange['Mermaid festa vol.2']='Mermaid festa vol.2 ~Passionate~'
namechange['ぷわぷわーお！']='ぷわぷわーお!'
namechange['愛してるばんざーい！（Piano Mix）']='愛してるばんざーい! (Piano mix)'
namechange['夜空はなんでも知ってるの？'] = '夜空はなんでも知ってるの?'
namechange['ダイスキだったらダイジョウブ！'] = 'ダイスキだったらダイジョウブ!'
#namechange[''] = ''
namechange['Pops heartで踊るんだもん！'] = 'Pops_heartで踊るんだもん!'
namechange['？←HEARTBEAT'] = '?←HEARTBEAT'

def name_to_url(name):
	if not namechange.has_key(name):
		return name
	else:
		print 'change'
		return namechange[name]

songs = json.loads(open('newsongsjson.txt', 'rb').read())
print repr('きっと青春が聞こえる')

sl = open('successlist.txt', 'r')
successlist = json.loads(sl.read())
sl.close()

mustlist =[]

for index in songs:
	song = songs[index]
	if song['jpname'] in successlist and not song['jpname'] in mustlist:
		#print song['jpname'].encode('utf-8').decode('utf-8')
		#print 'pass'
		continue
	try:
		wn = False
		openurl = False
		snum = 0
		if song.has_key('weightname'):
			if song['weightname'] != '':
				wn = True
				print song['weightname'].encode('utf-8').decode('utf-8')
				data = {'title':song['weightname'].encode('utf-8')}
		if not wn:
			print song['jpname'].encode('utf-8').decode('utf-8')
			data = {'title':name_to_url(song['jpname'].encode('utf-8'))}
		url = u'http://decaf.kouhi.me/lovelive/index.php?'+urllib.urlencode(data)
		tmp = urllib2.urlopen(url).read()
		openurl = True
		retb = re.compile('<table class="wikitable" width="[\d]+px" style="text-align:center;">[\s\S]*?</table>')
		tb = retb.findall(tmp)[0]
		#print tb
		diffs = ['Easy', 'Normal', 'Hard', 'Expert', 'Master']
		for diff in diffs:
			rediff = re.compile('<tr>\n<td> <b>'+diff+'</b>[\s\S]*?</tr>')
			diffinfo = rediff.findall(tb)
			if len(diffinfo) > 0:
				repos = re.compile('[.\d]+')
				pos = repos.findall(diffinfo[0])
				if song[diff.lower()]['positionweight'][0] == u'':
					song[diff.lower()]['positionweight'] = pos
				snum += 1
		print snum
		successlist.append(song['jpname'])
		print 'success'
	except KeyboardInterrupt:
		exit()
	except:
		if not openurl:
			#print url
			print "can't open url"
		elif snum == 0:
			print traceback.print_exc()
			print 'no distribution'
		elif snum == 3:
			print 'no ex distribution'
		elif snum == 4:
			print 'no master distribution'
	#break
output = open('newsongsjson.txt', 'wb')
output.write(json.dumps(songs))
output.close()
slo = open('successlist.txt', 'w')
slo.write(json.dumps(successlist))
slo.close()


'''
data = {'title':'永遠フレンズ'}
print urllib.urlencode(data)
url = 'http://decaf.kouhi.me/lovelive/index.php?'+urllib.urlencode(data)
tmp = urllib2.urlopen(url).read()
#print tmp
retb = re.compile('<table class="wikitable" width="750px" style="text-align:center;">[\s\S]*?</table>')
tb = retb.findall(tmp)[0]
print tb
diffs = ['Easy', 'Normal', 'Hard', 'Expert']
for diff in diffs:
	print diff.lower()
	rediff = re.compile('<tr>\n<td> <b>'+diff+'</b>[\s\S]*?</tr>')
	diffinfo = rediff.findall(tb)
	print diffinfo
	if len(diffinfo) > 0:
		repos = re.compile('[.\d]+')
		pos = repos.findall(diffinfo[0])
		print pos
'''