import urllib2
import os
import urlparse
import json
import threading
import Queue
import sys
import ctypes

LLSIF_WIN_API_DOMAIN = 'http://a.llsif.win/'
LLSIF_WIN_API_ENDPOINT = 'live/json/'

NOTE_TYPE_RANDOM = 0
NOTE_TYPE_NORMAL = 1
NOTE_TYPE_EVENT = 2
NOTE_TYPE_HOLD = 3
NOTE_TYPE_BOMB_1 = 4
NOTE_TYPE_BOMB_3 = 5
NOTE_TYPE_BOMB_5 = 6
NOTE_TYPE_BOMB_9 = 7
NOTE_TYPE_SWING = 11
NOTE_TYPE_SWING_EVENT = 12
NOTE_TYPE_SWING_HOLD = 13

NOTE_WEIGHT_BASE = 1.0
NOTE_WEIGHT_HOLD_FACTOR = 1.25
NOTE_WEIGHT_SWING_FACTOR = 0.5

STATUS_SKIPPED = 0
STATUS_SUCCESSFUL = 1
STATUS_ERROR = 2
STATUS_KEYBOARD_INTERRUPT = 3
STATUS_EXIT = 4

NUMBER_OF_PROCESSES = 20

FILENAME_SUCCESSFUL_LOG = 'success.json'
FILENAME_SONG_LIST_JSON = 'newsongsjson.txt'

difficultyKeys = ['easy', 'normal', 'hard', 'expert', 'master', 'arcade']

TITLE_WELCOME = '''# Welcome to LLHelper LLSIF Song Updater!

* Song data based on `%s`.
* Program originally authored by **Chazeon** and the end of Sept 2017 in NY.
* Updated by **ben1222** at 2018 July

* We are now updating song list file: `%s`.
* Song log will be loaded from and written to: `%s`.
''' % (LLSIF_WIN_API_DOMAIN, FILENAME_SONG_LIST_JSON, FILENAME_SUCCESSFUL_LOG)

class Note:
    def __init__(self, noteDict):
        self.level = noteDict['notes_level']
        self.type = noteDict['effect']
        self.position = noteDict['position']
        self.attribute = noteDict['notes_attribute']
        self.appearTime = noteDict['timing_sec']
        self.effectValue = noteDict['effect_value']
    def isHold(self):
        return self.type in [NOTE_TYPE_HOLD, NOTE_TYPE_SWING_HOLD]
    def isSwing(self):
        return self.type in [NOTE_TYPE_SWING, NOTE_TYPE_SWING_EVENT, NOTE_TYPE_SWING_HOLD]
    def getNoteWeightedValue(self):
        weightValue = NOTE_WEIGHT_BASE
        if self.isSwing():
            weightValue *= NOTE_WEIGHT_SWING_FACTOR
        if self.isHold():
            weightValue *= NOTE_WEIGHT_HOLD_FACTOR
        return weightValue

def getLiveMapJsonUrl(liveId):
    return LLSIF_WIN_API_DOMAIN + LLSIF_WIN_API_ENDPOINT + str(liveId)

def getLiveMap(liveId):
    liveJsonUrl = getLiveMapJsonUrl(liveId)
    liveJsonFp = urllib2.urlopen(liveJsonUrl)
    liveJson = json.load(liveJsonFp)
    return liveJson

def getPositionWeight(liveId):
    liveMap = getLiveMap(liveId)
    positionWeight = [0.0] * 9
    for note in liveMap:
        note = Note(note)
        position = 9 - note.position
        positionWeight[position] += note.getNoteWeightedValue()
    return map(str, positionWeight)

def main():
    songs = {}
    prevLoadedLives = []
    updatedLives = []

    with open(FILENAME_SONG_LIST_JSON, 'r') as f:
        songs = json.load(f)
    if os.path.exists(FILENAME_SUCCESSFUL_LOG):
        print('* Succesful log found at `%s`.' % FILENAME_SUCCESSFUL_LOG)
        with open(FILENAME_SUCCESSFUL_LOG, 'r') as f:
            prevLoadedLives = json.load(f)
            print('* %d live maps have previously loaded, skipping...' % len(prevLoadedLives))
    for liveId in [int(liveId) for liveId in songs.keys()]:
        if liveId not in prevLoadedLives:
            songs[str(liveId)]["positionweight"] = getPositionWeight(liveId)
            updatedLives.append(liveId)
            print('Getting position information for live #%d' % liveId)
    with open(FILENAME_SONG_LIST_JSON, 'w') as f:
        json.dump(songs, f, sort_keys=True)
    with open(FILENAME_SUCCESSFUL_LOG, 'w') as f:
        json.dump(prevLoadedLives + updatedLives, f, sort_keys=True)
    print('Newly updated %s' % repr(updatedLives))
 
if __name__ == '__main__':
    print TITLE_WELCOME
    main()
