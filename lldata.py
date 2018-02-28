import json

class LLData:
    def __init__(self):
        self.data = {}

    def loadJson(self, jsonfile):
        jsonstr = open(jsonfile, 'rb').read()
        self.data = json.loads(jsonstr)

    def queryByKeys(self, keys):
        ret = {}
        keylist = keys.split(',')
        for index, data in self.data.iteritems():
            outdata = {}
            for key in keylist:
                if key in data:
                    outdata[key] = data[key]
            ret[index] = outdata
        return ret

    def queryByIndex(self, index):
        if index in self.data:
            return self.data[index];
        return {};

