import json
import time, os, threading

class SimpleRWLock:
    def __init__(self):
        self.lock = threading.Lock()
        self.cond = threading.Condition(self.lock)
        self.reader_count = 0
        self.writer_count = 0
        self.writer_wait_count = 0

    def acquireRead(self):
        self.lock.acquire()
        while self.writer_count > 0 or self.writer_wait_count > 0:
            self.cond.wait()
        self.reader_count += 1
        self.lock.release()

    def releaseRead(self):
        self.lock.acquire()
        self.reader_count -= 1
        self.cond.notifyAll()
        self.lock.release()

    def acquireWrite(self):
        self.lock.acquire()
        self.writer_wait_count += 1
        while self.reader_count > 0 or self.writer_count > 0:
            self.cond.wait()
        self.writer_wait_count -= 1
        self.writer_count += 1
        self.lock.release()

    def releaseWrite(self):
        self.lock.acquire()
        self.writer_count -= 1
        self.cond.notifyAll()
        self.lock.release()

class LLData:
    def __init__(self, json_file, check_interval):
        self.data = {}
        self.check_interval = check_interval
        self.json_file = json_file
        self.lock = SimpleRWLock()
        self.last_check_time = 0
        self.last_update_time = 0
        self.loadJson()

    def getLastUpdateTime(self):
        self.lock.acquireRead()
        ret = self.last_update_time
        self.lock.releaseRead()
        return ret

    def mergeDataTo(self, data):
        self.lock.acquireRead()
        for i in self.data:
            if not data.has_key(i):
                data[i] = self.data[i]
        self.lock.releaseRead()

    def loadJson(self):
        # assume write lock acquired
        filestat = os.stat(self.json_file)
        if filestat.st_mtime != self.last_update_time:
            print 'Loading %s ...' % self.json_file
            jsonstr = open(self.json_file, 'rb').read()
            self.data = json.loads(jsonstr)
            self.last_update_time = filestat.st_mtime

    def reloadJson(self):
        cur_time = time.time()
        need_load = 0
        self.lock.acquireRead()
        if cur_time - self.last_check_time > self.check_interval:
            need_load = 1
        self.lock.releaseRead()

        if need_load == 0:
            return

        self.lock.acquireWrite()
        try:
            if cur_time - self.last_check_time > self.check_interval:
                self.loadJson()
                self.last_check_time = cur_time
        finally:
            self.lock.releaseWrite()

    def queryByKeys(self, keys):
        ret = {}
        keylist = keys.split(',')
        self.reloadJson()
        self.lock.acquireRead()
        try:
            for index, data in self.data.iteritems():
                outdata = {}
                for key in keylist:
                    if key in data:
                        outdata[key] = data[key]
                ret[index] = outdata
        finally:
            self.lock.releaseRead()
        return ret

    def queryByIndex(self, index):
        ret = {}
        self.lock.acquireRead()
        try:
            if index in self.data:
                ret = self.data[index];
        finally:
            self.lock.releaseRead()
        return ret;

class LLDataMix(LLData):
    def __init__(self, lldataList, name, check_interval):
        self.lldataList = lldataList
        LLData.__init__(self, name, check_interval)

    def loadJson(self):
        # assume write lock acquired
        max_update_time = 0
        for lldata in self.lldataList:
            lldata.reloadJson()
            this_update_time = lldata.getLastUpdateTime()
            if this_update_time > max_update_time:
                max_update_time = this_update_time

        if max_update_time == self.last_update_time:
            return

        print 'Loading mix %s ...' % self.json_file
        new_data = {}
        for lldata in self.lldataList:
            lldata.mergeDataTo(new_data)
        self.data = new_data
        self.last_update_time = max_update_time

