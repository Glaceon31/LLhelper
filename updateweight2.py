import urllib2
import os
import urlparse
import json
import multiprocessing

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

NUMBER_OF_PROCESSES = 5

difficultyKeys = ['easy', 'normal', 'hard', 'expert', 'master']

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
    def getNoteWeightedValue(self):
        weightValue = NOTE_WEIGHT_BASE
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

def updatePositionWeight(live, success, conn):
    liveId = int(live['liveid'])
    if liveId in success:
        conn.put((liveId, None, STATUS_SKIPPED, 'Skipped %d' % (liveId), None))
        return
    try:
        result = getPositionWeight(liveId)
        conn.put((liveId, None, STATUS_SUCCESSFUL, 'Successfully processed %d' % (liveId), result))
    except KeyboardInterrupt:
        exit()
    except Exception as e:
        conn.put((liveId, e, STATUS_ERROR, 'Failed to process %d' % (liveId), None))

def main():
    songs = {}
    successLives = []

    mpQueue = multiprocessing.Queue()
    mpProcs = []

    lives = {}

    with open('newsongsjson.txt', 'r') as f:
        songs = json.load(f)
    if os.path.exists('success.json'):
        with open('success.json', 'r') as f:
            successLives = json.load(f)
    for song in songs.values():
        for difficulty_name in [difficulty for difficulty in song.keys() if (difficulty in difficultyKeys)]:
            parentConn, childConn = multiprocessing.Pipe()
            live = song[difficulty_name]
            lives[live['liveid']] = live
            proc = multiprocessing.Process(target=updatePositionWeight, args=(live, successLives, mpQueue,))
            mpProcs.append(proc)
    
    mpProcsQueue = list(mpProcs)
    for i in range(0, NUMBER_OF_PROCESSES):
        mpProcsQueue.pop().start()
    for i in range(len(mpProcs)):
        liveId, error, status, message, result = mpQueue.get()
        print message
        if error:
            print error
            exit()
        if status == STATUS_SUCCESSFUL:
            successLives.append(liveId)
            lives[str(liveId)]['positionweight'] = result
        if len(mpProcsQueue) > 0:
            mpProcsQueue.pop().start()

    for proc in mpProcs:
        proc.join()

    with open('newsongsjson.txt', 'w') as f:
        #json.dump(songs, f, indent=2)
        json.dump(songs, f)
    with open('success.json', 'w') as f:
        json.dump(successLives, f, indent=2)
    print 'Successfully processed: %s' % (str(successLives))

if __name__ == '__main__':
    main()
