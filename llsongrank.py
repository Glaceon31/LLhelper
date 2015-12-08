from app import *

@app.route("/llsongvote", methods=['GET', 'POST'])
def llsongvote():
	songsjson = open('newsongsjson.txt', 'rb').read()
	return render_template('llsongvote.html', songsjson = songsjson)