from app import *

@app.route("/activitypt")
def activitypt():
       return render_template("activitypt.html")

@app.route("/llactivity", methods=['GET', 'POST'])
def llactivity():
    return render_template('llactivity.html')

@app.route("/smmulti")
def smmulti():
       return render_template("smmulti.html")

@app.route("/llsm", methods=['GET', 'POST'])
def llsm():
    return render_template('llscorematch.html')

@app.route("/llmf", methods=['GET', 'POST'])
def llmf():
    return render_template('llmedleyfestival.html')

@app.route("/llcf", methods=['GET', 'POST'])
def llcf():
    return render_template('llchallengefestival.html')

@app.route("/mfpt", methods=['GET', 'POST'])
def mfpt():
    return render_template('mfpt.html')

@app.route("/cfpt", methods=['GET', 'POST'])
def cfpt():
    return render_template('cfpt.html')
