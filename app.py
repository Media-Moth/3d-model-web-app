from flask import Flask, render_template, g, request, redirect, url_for, jsonify
import sqlite3
import os
from werkzeug.utils import secure_filename
import base64

DATABASE = 'database.db'

app = Flask(__name__)

UPLOAD_FOLDER = "static\models"
IMAGE_FOLDER = "static\images"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['IMAGE_FOLDER'] = IMAGE_FOLDER
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
    name = request.form['name']
    file = request.files['file']

    if 'file' not in request.files or name == '':
        print("1")
        return redirect(url_for('uploadSuccess'))
    if file.filename == '':
        print("2")
        return redirect(url_for('uploadSuccess'))

    if file and file.filename.rsplit('.', 1)[1] == 'glb':
        # if file is valid
        db = get_db()
        image = request.files['image']
        

        filename = secure_filename(file.filename)
        imagename = secure_filename(image.filename)

        # print(image.read())
        # image.seek(0)

        # file save does not work for some reason so we write it
        # file.save(os.path.join(app.config['IMAGE_FOLDER'], imagename))
        with open(f"{IMAGE_FOLDER}/{imagename}", "wb") as f:
            f.write(image.read())

        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        sql = """INSERT INTO models (name, file, thumbnail)
        VALUES (?, ?, ?);
        """
        query_db(sql, (name, filename, imagename))
        db.commit()
        return redirect(url_for('uploadSuccess'))
    return render_template("upload.html")

@app.route("/uploaded")
def uploadSuccess():
    return jsonify(url_for("show_upload"))

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