import json
import os

import click
from click import ClickException

from rfvis import __version__
from rfvis.server import start_server


@click.group()
@click.version_option(__version__)
def main():
    pass


@main.command()
@click.argument("forest_json", type=click.Path(exists=True))
@click.option("--port", default=8080)
def gui(forest_json, port):
    """Command line interface to generate SVGs"""
    start_server(_read_data(forest_json), use_reloader=True, port=port, debug=True)


@main.command()
@click.argument("data", type=click.Path(exists=True))
def cli(data):
    """Web-based graphical user interface"""
    # TODO


def _read_data(forest_json):
    with open(forest_json, "r") as f:
        try:
            forest = json.load(f)
        except json.decoder.JSONDecodeError:
            raise ClickException("The file \"{}\" is not a valid JSON.".format(forest_json))

    for tree in forest["trees"]:
        tree_csv_path = os.path.join(os.path.dirname(forest_json), tree["data"])
        try:
            with open(tree_csv_path, "r") as f:
                tree["data"] = f.read()
        except FileNotFoundError:
            raise ClickException("The file \"{}\" does not seem to exist.".format(tree_csv_path))

    return forest


if __name__ == '__main__':
    main()
