# -*- coding: utf-8 -*-
from app import *
import json
import re

@app.route("/test")
def test():
	inp = open('test.txt', 'rb')
	content = inp.read()
	inp.close()
	output = open('test.txt', 'wb')
	output.write(content+'1')
	output.close()
	return content