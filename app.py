from flask import Flask, render_template, g, request, redirect, url_for, flash
import sqlite3
import os
from werkzeug.utils import secure_filename

DATABASE = 'database.db'

app = Flask(__name__)

UPLOAD_FOLDER = "static\models"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = os.urandom(12)


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route("/upload", methods=["POST"])
def upload():
    if 'file' not in request.files:
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        return redirect(request.url)
    if file and file.filename.rsplit('.', 1)[1] == 'glb':
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return render_template("upload.html")
    

@app.route("/upload")
def show_upload():
    return render_template("upload.html")


@app.route("/")
def hello_world():
    results = query_db("SELECT * FROM models")
    return render_template("home.html", results=results)


@app.route('/model/<int:model_id>')
def show_post(model_id):
    result = query_db("SELECT * FROM models WHERE id=?", (model_id,), one=True)
    return render_template("model.html", result=result)


if __name__ == "__main__":
    app.run(debug=True)