# -*- coding: utf-8 -*-
import json
import os
import hashlib
import sqlite3
import re

json_file = 'metadata.txt'
translate_cn_file = 'translate-cn.txt'

jpdbpath = 'unitnewjp.db_'

def translateCn(cur_data, key, translate_cn_data):
    cur_data[key] = cur_data[key].replace('<br>', ' ')
    jp_text = cur_data[key]
    if jp_text and translate_cn_data.has_key(jp_text):
        cur_data['cn' + key] = translate_cn_data[jp_text]

def commonHandleMetadataArray(dbconn, metadata, json_key, main_query):
    if not metadata.has_key(json_key):
        count_before = 0
    else:
        count_before = len(metadata[json_key])
    new_arr = []

    query = dbconn.execute(main_query)
    row = query.fetchone()
    while row:
        cur_id = row[0]
        new_arr.append(cur_id)

        row = query.fetchone()

    metadata[json_key] = new_arr

    print '%s : before %d, after %d' % (json_key, count_before, len(metadata[json_key]))

def commonHandleMetadataTable(dbconn, metadata, json_key, main_query, row_handler, translate_cn_data):
    count_new = 0
    count_row = 0
    if not metadata.has_key(json_key):
        metadata[json_key] = {}
    mdata = metadata[json_key]
    count_before = len(mdata)

    query = dbconn.execute(main_query)
    row = query.fetchone()
    while row:
        count_row += 1
        cur_id = row[0]
        cur_name = row[1]
        if not mdata.has_key(str(cur_id)):
            print 'New %s %d : %s' % (json_key, cur_id, cur_name)
            count_new += 1
            mdata[str(cur_id)] = {}
        cur_data = mdata[str(cur_id)]
        row_handler(dbconn, cur_data, row, translate_cn_data)

        row = query.fetchone()

    print '%s : before %d, after %d, db %d, new %d' % (json_key, count_before, len(mdata), count_row, count_new)

def handleAlbum(dbconn, cur_data, row, translate_cn_data):
    cur_data['name'] = row[1]
    translateCn(cur_data, 'name', translate_cn_data)

def handleMemberTag(dbconn, cur_data, row, translate_cn_data):
    cur_data['name'] = row[1]
    translateCn(cur_data, 'name', translate_cn_data)
    unit_arr = []
    rel_query = dbconn.execute('SELECT unit_type_id from unit_type_member_tag_m WHERE member_tag_id = %d;' % row[0])
    rel_row = rel_query.fetchone()
    while rel_row:
        unit_arr.append(rel_row[0])
        rel_row = rel_query.fetchone()
    cur_data['members'] = unit_arr

def handleUnitType(dbconn, cur_data, row, translate_cn_data):
    cur_data['name'] = row[1]
    translateCn(cur_data, 'name', translate_cn_data)
    if row[2]:
        cur_data['color'] = row[2]

if __name__ == "__main__":
    if not os.path.exists(json_file):
        print 'Creating metadata json: %s ...' % json_file
        metadata = {}
    else:
        print 'Updating metadata json: %s ...' % json_file
        metadata = json.loads(open(json_file, 'rb').read())

    translate_cn_data = {}
    if os.path.exists(translate_cn_file):
        print 'Found translate cn file: %s' % translate_cn_file
        translate_cn_data = json.loads(open(translate_cn_file, 'rb').read())

    jpdbconn = sqlite3.connect(jpdbpath)

    # album
    commonHandleMetadataTable(jpdbconn, metadata, 'album', 'SELECT album_series_id, name FROM album_series_m;', handleAlbum, translate_cn_data)

    # member tag
    commonHandleMetadataTable(jpdbconn, metadata, 'member_tag', 'SELECT member_tag_id, name FROM member_tag_m;', handleMemberTag, translate_cn_data)

    # unit type
    commonHandleMetadataTable(jpdbconn, metadata, 'unit_type', 'SELECT unit_type_id, name, original_attribute_id FROM unit_type_m;', handleUnitType, translate_cn_data)

    # cskill types
    commonHandleMetadataArray(jpdbconn, metadata, 'cskill_groups', 'SELECT member_tag_id FROM unit_leader_skill_extra_m GROUP BY member_tag_id;')


    output = open(json_file, 'wb')
    output.write(json.dumps(metadata, sort_keys=True))
    output.close()

    print 'Updated %s' % json_file

