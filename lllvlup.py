from app import *

@app.route("/lllvlup", methods=['GET', 'POST'])
def lllvlup():
    return render_template("lllvlup.html")
