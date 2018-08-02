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
live_setting_query_str = (
'SELECT live_setting_m.live_setting_id,'
' live_setting_m.difficulty,'
' live_setting_m.stage_level,'
' live_setting_m.attribute_icon_id,'
' live_setting_m.notes_setting_asset,'
' live_setting_m.c_rank_score,'
' live_setting_m.b_rank_score,'
' live_setting_m.a_rank_score,'
' live_setting_m.s_rank_score,'
' live_setting_m.s_rank_combo,'
' CASE WHEN special_live_m.ac_flag IS NOT NULL THEN 1 ELSE 0 END as is_ac '
'FROM live_setting_m '
'LEFT JOIN special_live_m ON special_live_m.live_setting_id = live_setting_m.live_setting_id AND special_live_m.ac_flag = 1 '
'WHERE live_track_id = %s;'
)

if __name__ == "__main__":
	jpdbconn = sqlite3.connect(livejpdbpath)
	cndbconn = sqlite3.connect(livecndbpath)
	jptc = jpdbconn.execute('SELECT live_track_id,name,member_category FROM live_track_m;')
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
		if jptmp[2] == 1:
			song['muse'] = 1
			song['aqours'] = 0
		else:
			song['muse'] = 0
			song['aqours'] = 1
		livesetting = jpdbconn.execute(live_setting_query_str % str(jptmp[0]))
		livetmp = livesetting.fetchone()
		while livetmp:
			# AC charts
			if livetmp[10] == 1:
				diffname = 'arcade'
			else:
				diffname = difficulty[livetmp[1]]
			if diffname =='random':
				song['expert']['randomdifficulty'] = livetmp[2]
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
			diff['stardifficulty'] = livetmp[2]
			diff['combo'] = livetmp[9]
			diff['cscore'] = livetmp[5]
			diff['bscore'] = livetmp[6]
			diff['ascore'] = livetmp[7]
			diff['sscore'] = livetmp[8]
			jsonpath = livetmp[4]
			song['attribute'] = attribute[livetmp[3]]
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
	output.write(json.dumps(songs, sort_keys=True))
	output.close()
