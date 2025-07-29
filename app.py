from flask import Flask, render_template, g
import sqlite3

DATABASE = 'database.db'

app = Flask(__name__)


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