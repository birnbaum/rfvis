import os

from flask import Flask, send_from_directory, jsonify


def start_server(data, port=8080, debug=False, use_reloader=False, **kwargs):
    app = Flask(__name__, static_folder='client/build')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_app(path):
        build_path = os.path.join(os.path.dirname(__file__), "client", "build")
        if path != "" and os.path.exists(os.path.join(build_path, path)):
            return send_from_directory(build_path, path)
        else:
            return send_from_directory(build_path, 'index.html')

    @app.route('/data')
    def serve_data():
        return jsonify(data)

    os.environ['WERKZEUG_RUN_MAIN'] = 'true'
    app.run(port=port, debug=debug, use_reloader=use_reloader, **kwargs)
