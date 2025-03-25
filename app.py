
from flask import Flask, render_template, send_from_directory, jsonify, session, request
from datetime import timedelta
import os

app = Flask(__name__)

@app.route("/")
def index():
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
