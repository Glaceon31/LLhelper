from flask import Blueprint, render_template, abort

legacy_app = Blueprint('legacy', __name__)
legacy_app.template_folder = legacy_app.root_path

### activity ###
@legacy_app.route("/activitypt")
def activitypt():
       return render_template("activitypt.html")

@legacy_app.route("/llactivity", methods=['GET', 'POST'])
def llactivity():
    return render_template('legacy/templates/llactivity.html')

@legacy_app.route("/llrally", methods=['GET', 'POST'])
def llrally():
    return render_template('legacy/templates/llrally.html')

@legacy_app.route("/smmulti")
def smmulti():
       return render_template("smmulti.html")

@legacy_app.route("/llsm", methods=['GET', 'POST'])
def llsm():
    return render_template('legacy/templates/llscorematch.html')

@legacy_app.route("/llmf", methods=['GET', 'POST'])
def llmf():
    return render_template('legacy/templates/llmedleyfestival.html')

@legacy_app.route("/llcf", methods=['GET', 'POST'])
def llcf():
    return render_template('legacy/templates/llchallengefestival.html')

@legacy_app.route("/llnm", methods=['GET', 'POST'])
def llnm():
    return render_template('legacy/templates/llnakayoshi.html')

@legacy_app.route("/mfpt", methods=['GET', 'POST'])
def mfpt():
    return render_template('legacy/templates/mfpt.html')

@legacy_app.route("/cfpt", methods=['GET', 'POST'])
def cfpt():
    return render_template('legacy/templates/cfpt.html')

@legacy_app.route("/nmpt", methods=['GET', 'POST'])
def nmpt():
    return render_template('legacy/templates/nmpt.html')

### data ###
@legacy_app.route("/llsongdata")
def llsongdata():
    songsjson = open('newsongsjson.txt', 'rb').read()
    return render_template('legacy/templates/llsongdata.html', songsjson = songsjson)

@legacy_app.route("/llcoverage")
def llcoverage():
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template('legacy/templates/llcoverage.html', cardsjson = cardsjson)

@legacy_app.route("/llnewcarddata")
def llnewcarddata():
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template('legacy/templates/llnewcarddata.html', cardsjson = cardsjson)

@legacy_app.route("/llurcardrank")
def llurcardrank():
    cardsjson = open('newcardsjson.txt', 'rb').read()
    return render_template('legacy/templates/llurcardrank.html', cardsjson = cardsjson)

### species ###
@legacy_app.route("/llspecies", methods=['GET', 'POST'])
@legacy_app.route("/llurrank", methods=['GET', 'POST'])
def urrank():
    return render_template('legacy/templates/llurrank.html')

### level up ###
@legacy_app.route("/lllvlup", methods=['GET', 'POST'])
def lllvlup():
    return render_template('legacy/templates/lllvlup.html')

### mainpage ###
@legacy_app.route("/", methods=['GET', 'POST'])
def hello():
    return render_template('legacy/templates/mainpage.html')

@legacy_app.route("/about")
def about():
    return render_template('legacy/templates/about.html')
