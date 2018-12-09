import json
import os
from subprocess import CalledProcessError

import click
from click import ClickException

from rfvis import __version__
from rfvis.server import start_server


@click.group(context_settings=dict(max_content_width=90))
@click.version_option(__version__)
def main():
    """A tool for visualizing the structure and performance of Random Forests"""
    pass


@main.command()
@click.argument("forest_json", type=click.Path(exists=True), nargs=1)
@click.option("--port", "-p", default=8080, show_default=True, help="Port on which the GUI will run on.")
def gui(forest_json, port):
    """Web-based graphical user interface.

    FOREST_JSON: Path to the JSON file that contains the forest's data.
    """
    start_server(_read_data(forest_json), port=port, debug=False, use_reloader=False)


@main.command()
@click.argument("forest_json", type=click.Path(exists=True), nargs=1)
@click.option("--out", "-o", default=os.getcwd(), show_default="current working directory",
              type=click.Path(exists=True), help="Output path of the SVG files.")
@click.option("--width", "-w", default=800, show_default=True, help="Width of the SVG.")
@click.option("--height", "-h", default=800, show_default=True, help="Height of the SVG.")
@click.option("--trunk-length", default=100, show_default=True,
              help="Length of the trunk which influences the overall tree size.")
@click.option("--display-depth", type=int, help="Maximum depth of the tree rendering. Cut of leaves are "
                                                "visualized as pie chart consolidation nodes.")
@click.option("--branch-color", default="Impurity", show_default=True, type=click.Choice(["Impurity"]),
              help="Coloring of the branches.")
@click.option("--leaf-color", default="Impurity", show_default=True, type=click.Choice(["Impurity", "Best Class"]),
              help="Coloring of the leaves.")
def cli(forest_json, out, width, height, trunk_length, display_depth, branch_color, leaf_color):
    """Command line interface to generate SVGs.

    As Python is unable to render React components, we make a subprocess call to a small Node.js application which
    will do the rendering and also store the created SVG files. This command requires that Node.js is installed on your
    system!

    FOREST_JSON: Path to the JSON file that contains the forest's data.
    """
    import subprocess
    data = _read_data(forest_json)
    out = os.path.abspath(out)
    config = json.dumps({
        "width": width,
        "height": height,
        "displayDepth": display_depth,
        "trunkLength": trunk_length,
        "branchColor": branch_color,
        "leafColor": leaf_color,
    })

    try:
        abs_path = os.path.normpath(os.path.join(__file__, "../../client/build/render_tree_script.js"))
        process = subprocess.Popen(["node", abs_path, config, out],
                                   stdin=subprocess.PIPE,
                                   stdout=subprocess.PIPE)
        output = process.communicate(json.dumps(data).encode("utf8"))
    except CalledProcessError:
        raise ClickException("Please make sure that you have a recent version of Node.js installed on your system.\n"
                             "See: https://github.com/birnbaum/rfvis#command-line-interface")
    print(output[0].decode())


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
