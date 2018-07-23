# -*- coding: utf-8 -*-
import json
import os
import hashlib
import sqlite3
import re
import gzip

livejpdbpath = 'livenewjp.db_'
livecndbpath = 'livecn.db_'
#oldsongs = json.loads(open('songsjson.txt', 'rb').read())
songs = json.loads(open('newsongsjson.txt', 'rb').read())
livejsonpath = 'livejson/'

attribute = ['','smile', 'pure', 'cool', '', 'all']
difficulty = ['' ,'easy', 'normal', 'hard', 'expert', 'random', 'master']

if __name__ == "__main__":
	jpdbconn = sqlite3.connect(livejpdbpath)
	cndbconn = sqlite3.connect(livecndbpath)
	jptc = jpdbconn.execute('SELECT * FROM live_track_m;')
	jptmp = jptc.fetchone()
	while jptmp:
		new = False
		if not songs.has_key(str(jptmp[0])):
			new = True
			songs[str(jptmp[0])] = {}
			song = songs[str(jptmp[0])]
			song['type'] = ''
			song['totaltime'] = 0
			song['bpm'] = 0
			song['name'] = jptmp[1]
			#song['cnhave'] = 0
		song = songs[str(jptmp[0])]
		song['jpname'] = jptmp[1]
		song['id'] = jptmp[0]
		if jptmp[5] == 1:
			song['muse'] = 1
			song['aqours'] = 0
		else:
			song['muse'] = 0
			song['aqours'] = 1
		livesetting = jpdbconn.execute('SELECT * FROM live_setting_m WHERE live_track_id = '+str(jptmp[0])+';')
		livetmp = livesetting.fetchone()
		while livetmp:
			# Exclude AC charts
			if livetmp[0] >= 10000:
				continue
			diffname = difficulty[livetmp[2]]
			if diffname =='random':
				song['expert']['randomdifficulty'] = livetmp[3]
			if not song.has_key(diffname):
				song[diffname] = {}
				diff = song[diffname]
				diff['sm'] = ''
				diff['mf'] = ''
				diff['lp'] = 0
				diff['exp'] = 0
				diff['time'] = ''
				diff['cnhave'] = 0
				diff['star'] = 0
				diff['randomdifficulty'] = ''
				diff['oldstardifficulty'] = ''
				diff['oldrandomdifficulty'] = ''
				diff['positionnote'] = ['','','','','','','','','']
				diff['positionslider'] = ['','','','','','','','','']
				diff['positionweight'] = ['','','','','','','','','']
			diff = song[diffname]
			diff['liveid'] = str(livetmp[0])
			diff['stardifficulty'] = livetmp[3]
			diff['combo'] = livetmp[17]
			diff['cscore'] = livetmp[10]
			diff['bscore'] = livetmp[11]
			diff['ascore'] = livetmp[12]
			diff['sscore'] = livetmp[13]
			jsonpath = livetmp[9]
			song['attribute'] = attribute[livetmp[4]]
			livetmp = livesetting.fetchone()

		#dangerous
		'''
		for oldsong in oldsongs:
			if oldsong['jpname'] == song['jpname']:
				songdiff = ''
				if oldsong['difficulty'] == 'Hard':
					song['name'] = oldsong['name']
					song['type'] = oldsong['type']
					song['bpm'] = oldsong['bpm']
					song['totaltime'] = oldsong['totaltime']
					song['easy']['sm'] = oldsong['sm']
					song['easy']['mf'] = oldsong['mf']
					song['easy']['cnhave'] = oldsong['cnhave']
					song['easy']['lp'] = 5
					song['easy']['exp'] = 12
					song['normal']['lp'] = 10
					song['normal']['exp'] = 26
					song['normal']['sm'] = oldsong['sm']
					song['normal']['mf'] = oldsong['mf']
					song['normal']['cnhave'] = oldsong['cnhave']
					songdiff = 'hard'
				elif oldsong['difficulty'] == 'Ex':
					songdiff = 'expert'
				song[songdiff]['time'] = oldsong['time']
				song[songdiff]['oldstardifficulty'] = oldsong['oldstardifficulty']
				song[songdiff]['oldrandomdifficulty'] = oldsong['oldrandomdifficulty']
				song[songdiff]['lp'] = oldsong['lp']
				song[songdiff]['exp'] = oldsong['exp']
				song[songdiff]['star'] = oldsong['star']
				song[songdiff]['positionweight'] = oldsong['positionweight']
				song[songdiff]['positionslider'] = oldsong['positionslider']
				song[songdiff]['positionnote'] = oldsong['positionnote']
				song[songdiff]['sm'] = oldsong['sm']
				song[songdiff]['mf'] = oldsong['mf']
				song[songdiff]['cnhave'] = oldsong['cnhave']
		'''
		jptmp = jptc.fetchone()



	output = open('newsongsjson.txt', 'wb')
	output.write(json.dumps(songs))
	output.close()
