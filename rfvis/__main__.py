import json
import os
import tarfile
import tempfile

import click
from click import ClickException

from rfvis import __version__, start_server


@click.group(context_settings=dict(max_content_width=90))
@click.version_option(__version__)
def main():
    """A tool for visualizing the structure and performance of Random Forests"""
    pass


@main.command()
@click.argument("forest_data", type=click.Path(exists=True), nargs=1)
@click.option("--port", "-p", default=8080, show_default=True, help="Port on which the GUI will run on.")
def gui(forest_data, port):
    """Web-based graphical user interface.

    FOREST_DATA: Path to the JSON file that contains the forest's data. Can also take a directory or tar file which
        contains the JSON.
    """
    data = _read_data(forest_data)
    start_server(data, port=port, debug=False, use_reloader=False)


@main.command()
@click.argument("forest_data", type=click.Path(exists=True), nargs=1)
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
def cli(forest_data, out, width, height, trunk_length, display_depth, branch_color, leaf_color):
    """Command line interface to generate SVGs.

    As Python is unable to render React components, we make a subprocess call to a small Node.js application which
    will do the rendering and also store the created SVG files. This command requires that Node.js is installed on your
    system!

    FOREST_DATA: Path to the JSON file that contains the forest's data. Can also take a directory or tar file which
        contains the JSON.
    """
    import subprocess
    data = _read_data(forest_data)
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
        script_path = os.path.join(os.path.dirname(__file__), "client", "build", "render_tree_script.js")
        process = subprocess.Popen(["node", script_path, config, out],
                                   stdin=subprocess.PIPE,
                                   stdout=subprocess.PIPE)
        output = process.communicate(json.dumps(data).encode("utf8"))
    except FileNotFoundError:
        raise ClickException("Please make sure that you have a recent version of Node.js installed on your system.\n"
                             "See: https://github.com/birnbaum/rfvis#command-line-interface")
    print(output[0].decode())


def _read_data(forest_data):
    """Reads forest data from the filesystem

    Args:
        forest_data (str): Either the path a folder or .tar.gz that contains a file called "forest.json" or the path
            to the forest JSON file itself.
    Returns:
        (dict) Forest data
    """
    if not os.path.isdir(forest_data) and tarfile.is_tarfile(forest_data):
        tmpdir = tempfile.TemporaryDirectory().name
        with tarfile.open(forest_data) as tar:
            tar.extractall(tmpdir)
            forest_data = tmpdir

    if os.path.isdir(forest_data):
        forest_json = os.path.join(forest_data, "forest.json")
        if not os.path.exists(forest_json):
            raise ClickException("The provided directory \"{}\" does not contain a file called \"forest.json\""
                                 .format(forest_data))
    else:
        forest_json = forest_data
        forest_data = os.path.dirname(forest_json)

    with open(forest_json, "r") as f:
        try:
            forest = json.load(f)
        except json.decoder.JSONDecodeError:
            raise ClickException("The file \"{}\" is not a valid JSON.".format(forest_data))

    for tree in forest["trees"]:
        tree_csv_path = os.path.join(forest_data, tree["data"])
        try:
            with open(tree_csv_path, "r") as f:
                tree["data"] = f.read()
        except FileNotFoundError:
            raise ClickException("The file \"{}\" does not seem to exist.".format(tree_csv_path))

    return forest


if __name__ == '__main__':
    main()
