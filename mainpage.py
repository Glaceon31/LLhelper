from app import *

@app.route("/", methods=['GET', 'POST'])
def hello():
    return render_template('mainpage.html')

@app.route("/about")
def about():
    return render_template('about.html')

@app.route("/try", methods=['GET', 'POST'])
def try1():
    return render_template('try.html')
