import json
import os

from flask import Flask, send_from_directory, jsonify, abort, Response


def start_server(data, **kwargs):
    app = Flask(__name__, static_folder='../client/build')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_app(path):
        if path != "" and os.path.exists("../client/build/" + path):
            return send_from_directory('../client/build', path)
        else:
            return send_from_directory('../client/build', 'index.html')

    @app.route('/data')
    def serve_data():
        path = os.path.join(os.getcwd(), data)

        forest_json_path = os.path.join(path, "forest.json")
        try:
            with open(forest_json_path, "r") as f:
                forest = json.load(f)
        except FileNotFoundError:
            return abort(Response("The file \"{}\" does not seem to exist.".format(forest_json_path), status=400))

        for tree in forest["trees"]:
            try:
                with open(os.path.join(path, tree["data"]), "r") as f:
                    tree["data"] = f.read()
            except FileNotFoundError:
                return abort(Response("The file \"{}\" does not seem to exist.".format(forest_json_path), status=400))

        return jsonify(forest)

    app.run(**kwargs)
