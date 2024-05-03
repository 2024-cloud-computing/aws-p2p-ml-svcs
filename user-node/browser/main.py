from flask import Flask, render_template, request
from flask_cors import CORS, cross_origin
import bcrypt

app = Flask(__name__)
cors = CORS(app)

import sql

db = sql.MySQLConn()
db.create_table()

@app.route('/')
@cross_origin()
def index():
    return render_template("login.html")


@app.route('/register')
@cross_origin()
def new_user():
    return render_template("register.html")

@app.route('/insert', methods=['post'])
@cross_origin()
def insert():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        hashed = bcrypt.hashpw(str.encode(password), bcrypt.gensalt( 12 ))
        if db.check_user(username):
            db.insert_user(username, hashed, firstname, lastname)
        else:
            return render_template("loginfail.html")
        return render_template("mainpage.html", username=username)

@app.route('/checkuser', methods=['post'])
@cross_origin()
def checkuser():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if db.auth_user(username, password):
            return render_template("mainpage.html", username=username)
        else:
            return render_template("loginfail.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)