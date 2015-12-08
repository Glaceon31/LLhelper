from app import *

@app.route("/llcardapiwiki")
def llcardapi():
       return open("cardsjson.txt").read()

@app.route("/llmapapiwiki")
def llmapapi():
       return open("songsjson.txt").read()

@app.route("/document")
def document():
    return send_file("document.txt")
