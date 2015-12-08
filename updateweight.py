# -*- coding: utf-8 -*-
import json
import os
import hashlib
import sqlite3
import urllib2
import urllib
import re

songs = json.loads(open('newsongsjson.txt', 'rb').read())
print repr('きっと青春が聞こえる')

for index in songs:
	song = songs[index]
	try:
		print song['jpname'].encode('utf-8').decode('utf-8')
		data = {'title':song['jpname'].encode('utf-8')}
		url = u'http://decaf.kouhi.me/lovelive/index.php?'+urllib.urlencode(data)
		tmp = urllib2.urlopen(url).read()
		retb = re.compile('<table class="wikitable" width="750px" style="text-align:center;">[\s\S]*?</table>')
		tb = retb.findall(tmp)[0]
		diffs = ['Easy', 'Normal', 'Hard', 'Expert']
		for diff in diffs:
			rediff = re.compile('<tr>\n<td> <b>'+diff+'</b>[\s\S]*?</tr>')
			diffinfo = rediff.findall(tb)
			if len(diffinfo) > 0:
				repos = re.compile('[.\d]+')
				pos = repos.findall(diffinfo[0])
				if song[diff.lower()]['positionweight'][0] == u'':
					song[diff.lower()]['positionweight'] = pos
		print 'success'
	except:
		print 'fail'
	#break
output = open('newsongsjson.txt', 'wb')
output.write(json.dumps(songs))
output.close()


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