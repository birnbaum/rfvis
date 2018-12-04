import os

from flask import Flask, send_from_directory, jsonify


def start_server(data, **kwargs):
    app = Flask(__name__, static_folder='client/build')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_app(path):
        if path != "" and os.path.exists("client/build/" + path):
            return send_from_directory('../client/build', path)
        else:
            return send_from_directory('../client/build', 'index.html')

    @app.route('/data')
    def serve_data():
        return jsonify(data)

    app.run(**kwargs)
