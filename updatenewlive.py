# -*- coding: utf-8 -*-
import json
import os
import hashlib
import sqlite3
import re
import gzip

livejpdbpath = 'livenewjp.db_'
livecndbpath = 'livecn.db_'
json_file = 'newsongsjson.txt'
#oldsongs = json.loads(open('songsjson.txt', 'rb').read())
songs = json.loads(open(json_file, 'rb').read())
livejsonpath = 'livejson/'

song_count_in_db = 0
song_count_in_json = len(songs)
song_count_new = 0

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
' live_setting_m.ac_flag as is_ac,'
' live_setting_m.swing_flag as is_swing '
'FROM live_setting_m '
'WHERE live_track_id = %s;'
)

if __name__ == "__main__":
	print 'Updating songs json: %s ...' % json_file
	jpdbconn = sqlite3.connect(livejpdbpath)
	cndbconn = sqlite3.connect(livecndbpath)
	jptc = jpdbconn.execute('SELECT live_track_id,name,member_category FROM live_track_m;')
	jptmp = jptc.fetchone()
	while jptmp:
		song_count_in_db += 1
		song_id = jptmp[0]
		song_key = str(song_id)
		if not songs.has_key(song_key):
			print 'New song %d' % song_id
			song_count_new += 1
			songs[song_key] = {}
			song = songs[song_key]
			song['type'] = ''
			song['totaltime'] = 0
			song['bpm'] = 0
			song['name'] = jptmp[1]
			#song['cnhave'] = 0
		song = songs[song_key]
		song['jpname'] = jptmp[1]
		song['id'] = song_id
		if jptmp[2] == 1:
			song['muse'] = 1
			song['aqours'] = 0
		else:
			song['muse'] = 0
			song['aqours'] = 1
		livesetting = jpdbconn.execute(live_setting_query_str % song_key)
		livetmp = livesetting.fetchone()
		while livetmp:
			# AC charts
			if livetmp[10] == 1:
				diffname = 'arcade'
			elif livetmp[11] == 1 and livetmp[1] == 4:
				diffname = 'expert_swing'
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
			diff['jsonpath'] = livetmp[4]
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


	output = open(json_file, 'wb')
	output.write(json.dumps(songs, sort_keys=True))
	output.close()

	print 'Updated %s , song count = %d (old %d, new %d, db %d)' % (json_file, len(songs), song_count_in_json, song_count_new, song_count_in_db)
