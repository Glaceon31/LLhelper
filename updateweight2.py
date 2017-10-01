import urllib2
import os
import urlparse
import json
import multiprocessing
import sys

DIFFICULTY_KEYS_EASY = 'easy'
DIFFICULTY_KEYS_NORMAL = 'normal'
DIFFICULTY_KEYS_HARD = 'hard'
DIFFICULTY_KEYS_EXPERT = 'expert'
DIFFICULTY_KEYS_MASTER = 'master'

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

difficultyKeys = ['easy', 'normal', 'hard', 'expert', 'master']

TITLE_WELCOME = '''# Welcome to LLHelper LLSIF Song Updater!

* Song data based on `%s`.
* Program originally authored by **Chazeon** and the end of Sept 2017 in NY.

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

def updatePositionWeight(live):
    liveId = int(live['liveid'])
    try:
        result = getPositionWeight(liveId)
        return (liveId, None, STATUS_SUCCESSFUL, '* Successfully processed %d' % (liveId), result)
    except KeyboardInterrupt as e:
        return (liveId, e, STATUS_KEYBOARD_INTERRUPT, '* User trying to exit program', None)
    except Exception as e:
        return (liveId, e, STATUS_ERROR, '* Failed to process %d' % (liveId), None)

def positionWeightUpdateWorker(liveQueue, messageQueue, pipeOut):
    while True:
        if pipeOut.poll():
            signal = pipeOut.recv()
            if signal == STATUS_EXIT: break
        if liveQueue.empty(): break
        live = liveQueue.get()
        messageQueue.put(updatePositionWeight(live))

def main():
    songs = {}
    prevLoadedLives = []
    updatedLives = []

    messageQueue = multiprocessing.Queue()
    liveQueue = multiprocessing.Queue()
    liveQueueCount = 0
    mpProcs = []

    lives = {}

    with open(FILENAME_SONG_LIST_JSON, 'r') as f:
        songs = json.load(f)
    if os.path.exists(FILENAME_SUCCESSFUL_LOG):
        print '* Succesful log found at `%s`.' % FILENAME_SUCCESSFUL_LOG
        with open(FILENAME_SUCCESSFUL_LOG, 'r') as f:
            prevLoadedLives = json.load(f)
            print '* %d live maps have previously loaded, skipping...' % len(prevLoadedLives)
    print '* Skipping lives: %s' % (str(prevLoadedLives))
    for song in songs.values():
        for difficulty_name in [difficulty for difficulty in song.keys() if (difficulty in difficultyKeys)]:
            parentConn, childConn = multiprocessing.Pipe()
            live = song[difficulty_name]
            liveId = int(live['liveid'])
            if liveId not in prevLoadedLives:
                liveQueue.put(live)
                lives[live['liveid']] = live
                liveQueueCount += 1
    try:
        for i in range(0, NUMBER_OF_PROCESSES):
            pipeOut, pipeIn = multiprocessing.Pipe()
            proc = multiprocessing.Process(target=positionWeightUpdateWorker, args=(liveQueue, messageQueue, pipeOut,))
            proc.start()
            mpProcs.append((proc, pipeIn))
        for i in range(liveQueueCount):
            liveId, error, status, message, result = messageQueue.get()
            print message
            if status == STATUS_ERROR:
                print error
            if status == STATUS_SUCCESSFUL:
                updatedLives.append(liveId)
                lives[str(liveId)]['positionweight'] = result

        for proc, _ in mpProcs:
            proc.join()
    except KeyboardInterrupt:
        for proc, pipe in mpProcs:
            while not liveQueue.empty():
                liveQueue.get()
            pipe.send(STATUS_EXIT)

    with open(FILENAME_SONG_LIST_JSON, 'w') as f:
        json.dump(songs, f)
    print '* Successfully processed lives: `%s`.' % (str(updatedLives))
    with open(FILENAME_SUCCESSFUL_LOG, 'w') as f:
        prevLoadedLives.extend(updatedLives)
        json.dump(prevLoadedLives, f)
    print '* Successful log written to `%s`, %d records written (%d new).' % (FILENAME_SUCCESSFUL_LOG, len(prevLoadedLives), len(updatedLives))

if __name__ == '__main__':
    print TITLE_WELCOME
    main()
