# Random Forest Visualization Tool

A tool for analyzing the structure, performance and other attributes of Random Forests
![Tree](images/tree.png)

## Getting Started 

As prerequisites you need [Node.js](https://nodejs.org/en/download/) and the project dependencies installed (run `npm install` withtin you local copy of this respository).

## Project structure

The tool offers a command line interface which can either directly generate SVG files from your input data or spin up a web-based GUI for a more interactive analysis.

### Build

To build all necessary files, run:
```
$ npm run build
```
This will generate a `dist` folder which contains the "compiled" Javascript files for the frontend and backend, as well as the necessary assets and HTML.

### Run
The entrypoint of the tool is the `./dist/index.js` which is generated in the previous build step.

To see the available commands (`cli` and `gui`) run:
```
$ node ./dist/index.js

index.js [command]

Commands:
  index.js cli <data>  Command line interface to generate SVGs
  index.js gui <data>  Graphical User Interface

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

#### The Command Line Interface
To generate SVG files for each tree in the input data, run
```
$ node ./dist/index.js cli /path/to/data --out result
>> Exported "/dev/random-forest-visualization/result/tree-0.svg"
>> Exported "/dev/random-forest-visualization/result/tree-1.svg"
>> Exported "/dev/random-forest-visualization/result/tree-2.svg"
>> Exported "/dev/random-forest-visualization/result/tree-3.svg"
...
```

A full list of available options:
```
$ node ./dist/index.js cli
index.js cli <data>

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
  --branch-length, -b  Length of the trunk which influences the entire tree size
                                                         [number] [default: 100]
  --depth, -d          Depth of the tree rendering. Cut of leaves are visualized
                       as pie chart consolidation nodes.                [number]
  --leaf-color         Color of the leaves. Either the leaf impurity or the
                       class assigned to the leaf.
                            [choices: "impurity", "class"] [default: "impurity"]
  --branch-color       Color of the branches. Either the node's impurity or the
                       node's drop-of-impurity.
                    [choices: "impurity", "impurity-drop"] [default: "impurity"]
```

#### The Graphical User Interface
To interactively analyze your forest with the web-based GUI run:
```
$ node ./dist/index.js gui /path/to/data
Starting server
GUI running at http://localhost:3000
```
You can now open up your browser at <http://localhost:3000> to see something like this:
![Tree](images/screenshot.png)


## Input Data
The input data is expected to come in text files in the following folder structure:
- `./statistcis/forest.txt`: A text file containing the correlation matrix, tree strengths and overall forest strength
- `./statistcis/tree_<index>.txt`: One text file per tree in the forest with semicolon-separated values in the following format:
    - `Internal nodes`: height;  -; 0; size; impurity; drop of impurity; splitting grade; list of used feature IDs; fusion ID; path prediction, split point def; list of score IDs
    - `Leaf nodes`: height; ID; 1; size; impurity; class frequency


## Development
In order to make development more convenient (which means not having to run `npm run build` after every change change) you can run watchers on the source files. The recommended setup for development is to open two terminal processes and run:
1. `npm run watch:frontend` to automatically build any changes in the frontend related Javascript or SCSS files
2. `npm run watch:backend` to automatically build any changes in the command line interface or the server related Javascript files

Note that many files are used by the frontend _and_ backend, e.g. the logic for constructing and drawing the trees. A change to `./src/draw_tree.js` will therefore trigger both watchers.


## Built With

* [D3.js](https://d3js.org/) - Data Visualization Library
* [Yargs](https://github.com/yargs/yargs) - Command Line Parsing Library
* [Bulma](https://bulma.io/) - Lightweight CSS Framework
* [Express](https://expressjs.com/) - Web Application Framework
* [rollup.js](https://rollupjs.org/) - Module Bundler / Build Tool


### To Do
- Better GUI Screenshot