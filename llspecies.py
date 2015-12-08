from app import *

@app.route("/llspecies", methods=['GET', 'POST'])
@app.route("/llurrank", methods=['GET', 'POST'])
def urrank():
    return render_template("llurrank.html")

@app.route("/lloldspecies", methods=['GET', 'POST'])
def aji():
    return render_template("llurrank.html")

@app.route("/llurrankold", methods=['GET', 'POST'])
def urrankold():
    return render_template("llurrankold.html")