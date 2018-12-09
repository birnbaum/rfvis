import os

from flask import Flask, send_from_directory, jsonify


def start_server(data, port=8080, debug=False, use_reloader=False, **kwargs):
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

    os.environ['WERKZEUG_RUN_MAIN'] = 'true'
    app.run(port=port, debug=debug, use_reloader=use_reloader, **kwargs)
