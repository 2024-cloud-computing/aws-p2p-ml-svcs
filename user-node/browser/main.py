from flask import Flask, render_template, request

app = Flask(__name__)

import sql

db = sql.MySQLConn()
db.create_table()

@app.route('/')
def index():
    return render_template("login.html")


@app.route('/register')
def new_user():
    return render_template("register.html")

@app.route('/insert', methods=['post'])
def insert():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        if db.check_user(username):
            db.insert_user(username, password, firstname, lastname)
        else:
            return render_template("loginfail.html")
        return render_template("mainpage.html")

@app.route('/checkuser', methods=['post'])
def checkuser():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if db.auth_user(username, password):
            return render_template("mainpage.html")
        else:
            return render_template("loginfail.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)