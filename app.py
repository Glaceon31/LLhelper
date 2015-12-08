# -*- coding: utf-8 -*-
#import sae.kvdb
#from sae.storage import Bucket
from flask import Flask, render_template, redirect, session, request, send_file
import ll
import string
import random
import json


app = Flask(__name__)
app.secret_key = "hatsune miku"
app.debug = True

from mainpage import *
from llspecies import *
from llactivity import *
from llcard import *
from llunit import *
from lldataapi import *
from lldata import *
from lldatamodify import *
from lllvlup import *
from llsongrank import *
from test import *

if __name__ == "__main__":
    app.run()



