# RFVis

[![npm version](https://badge.fury.io/js/rfvis.svg)](https://www.npmjs.com/package/rfvis)
[![Dependency Status](https://david-dm.org/birnbaum/rfvis.svg)](https://david-dm.org/birnbaum/rfvis)
[![devDependency Status](https://david-dm.org/birnbaum/rfvis/dev-status.svg)](https://david-dm.org/birnbaum/rfvis#info=devDependencies)

A tool for visualizing the structure and performance of Random Forests (and other ensemble methods based on decision trees).

![Tree](images/tree.png)

## Getting Started 

Install and update RFVis via [pip](https://pip.pypa.io/en/stable/quickstart/):

```
$ pip install rfvis
```

This will allow you interactively visualize a fitted Random Forest (RF) in your
browser. To directly generate SVG files from your model you also need to install
[NodeJS](https://nodejs.org/en/download/), see [Command Line Interface](#command-line-interface) for more information.


## How To Use

RFVis offers a command line tool to either generate SVG files directly from
your input data (`rfvis cli <data>`) or to spin up a web-based GUI for a more
interactive analysis (`rfvis gui <data>`).

To see all available commands run:
```
$ rfvis --help

rfvis [command]

Commands:
  rfvis cli <data>  Command line interface to generate SVGs
  rfvis gui <data>  Graphical User Interface

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

### Graphical User Interface

To interactively analyze your forest with the web-based GUI run:
```
$ rfvis gui /path/to/data
Starting server
GUI running at http://localhost:8080
```
You can now open up your browser at <http://localhost:8080> to see something like this:

![Tree](images/screenshot.png)


### Command Line Interface

To use the Command Line Interface (CLI) you need to have
[NodeJS](https://nodejs.org/en/download/) v8+ installed on your system. This
is a technical limitation due to the fact that the rendering is written in
Javascript but I wanted to distribute the application via
[pip](https://pip.pypa.io/en/stable/quickstart/) which is more common in
machine learning than NodeJS.

You do not need to install any other package though, the CLI integrates into
the command line tool you already installed via pip:
```
$ rfvis cli /path/to/data
>> Exported "/dev/random-forest-visualization/tree-0.svg"
>> Exported "/dev/random-forest-visualization/tree-1.svg"
>> Exported "/dev/random-forest-visualization/tree-2.svg"
>> Exported "/dev/random-forest-visualization/tree-3.svg"
...
```

Get a full list of available options with `--help`:
```
$ rfvis cli --help
rfvis cli <data>

Command line interface to generate SVGs

Positionals:
  data  Folder containing the forest data                             [required]

Options:
  --help               Show help                                       [boolean]
  --version            Show version number                             [boolean]
  --out, -o            Output folder for the SVG files. If omitted the current
                       working directory is used.
  --width, -w          Width of the SVG                  [number] [default: 800]
  --height, -h         Height of the SVG                 [number] [default: 800]
  --trunk-length, -t   Length of the trunk which influences the entire tree size
                                                         [number] [default: 100]
  --depth, -d          Depth of the tree rendering. Cut of leaves are visualized
                       as pie chart consolidation nodes.                [number]
  --leaf-color         Color of the leaves. Either the leaf impurity or the
                       class assigned to the leaf.
                            [choices: "impurity", "class"] [default: "impurity"]
  --branch-color       Color of the branches. Either the node impurity or the
                       node drop-of-impurity.
                    [choices: "impurity", "impurity-drop"] [default: "impurity"]
```


## Visualization
???


## Input Data

Note: I am currently working a Python interface to RFVis which will allow
you to start the application programmatically via a fitted scikit-learn
[RandomForestClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html).

Currently all input data must be available on your filesystem as a JSON file
for the forest and additionally one CSV file per tree. Both data formats will
be extended with properties in the future, this is just the minimal set.

You can find a working example under `examples/PolSAR`!


#### Forest JSON

The main `forest.json` holds all information about the ensemble model:

- **name** (string): Name of your forest, will be displayed in the GUI
- **error** (float): The error (e.g. the out-of-bag or validation error) of the 
    entire ensemble model, will be displayed in the GUI
- **n_samples** (int): Number of samples the model was trained on
- **correlationMatrix** (float[][]): Correlation between the single trees within
    the model. Has dimensions `NxN` where `N` is the number of trees.
    This will be used to compute the forest map. 
- **classes**: The output classes
    - **name** (string): Name of the class
    - **color** (int, int, int): RGB values in the range of 0-255 which
        determine the color of the class in the visualization
- **trees**: The trees in the forest
    - **error** (float): The error (again could be either the out-of-bag or
        validation error) of the single tree
    - **data** (string): Relative path to the CSV file containing the tree data


#### Tree CSV

For each tree specified in the `forest.json` RFVis expects a CSV file where one
entry represents one node in the tree. An entry has the following format:

- **id** (int): ID of the node
- **depth** (int) Depth of the node in the tree (starting at `0`)
- **n_node_samples** (int): Number of training samples reaching the node
- **impurity** (float): Impurity of the node (`0`-`1`)
- **value** (int[]): Class distribution within the node, i.e. every entry 
    represents the amount of samples within the node that respond to a specific 
    class. The index corresponds to the indices in `forest.classes`.


## Development

TODO

To build and use the project locally just run `npm run build` and `npm link`.

In order to make development more convenient (which means not having to run `npm run build` after every change) you can run watchers on the source files. The recommended setup for development is to open two terminal processes and run:
1. `npm run watch:frontend` to automatically build any changes in the frontend related JS or SCSS files
2. `npm run watch:backend` to automatically build any changes in the command line interface or the server related JS files

Note that many files are used by the frontend _and_ backend, e.g. the logic for constructing and drawing the trees. A change to `./src/draw_tree.js` will therefore trigger both watchers.
