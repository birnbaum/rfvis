'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var fs = require('fs');
var d3 = require('d3');
var d3Component = require('d3-component');
require('d3-node');
var util = require('util');
var resolve = _interopDefault(require('rollup-plugin-node-resolve'));
var commonjs = _interopDefault(require('rollup-plugin-commonjs'));
var sass = _interopDefault(require('rollup-plugin-scss'));
var yargs = _interopDefault(require('yargs'));
var express = _interopDefault(require('express'));
require('rollup');

/**
 * Reads the provided txt files and construcs a forest object of the following form:
 *  {
 *      strength: float,
 *      correlationMatrix: [[float]],
 *      trees: [{
 *          strength: float,
 *          nodes: [
 *              [int, int, int, int, int]  // correspond to height, samples, impurity, impurityDrop, feature
 *          ]
 *      }]
 *  }
 *
 * @param {string} summaryFile - Path to the overall summary file
 * @param {string} statisticsDirectory - Path to the directory containing the tree statistics files
 * @returns {Object}
 */
function createForest(summaryFile, statisticsDirectory) {
    const summary = fs.readFileSync(summaryFile, 'utf-8');
    const summaryParts = summary.split('\n\n');

    const totalStrength = Number.parseFloat(summaryParts[0]);
    const correlationMatrix = parseCorrelationMatrix(summaryParts[2]);

    const treeFiles = fs.readdirSync(statisticsDirectory);
    const treeStrengths = summaryParts[1].split('\n').map(Number.parseFloat);

    // Sanity check
    if (treeFiles.length !== treeStrengths.length) {
        console.log(treeFiles, treeStrengths);
        console.log(treeFiles.length, treeStrengths.length);
        throw `Number of trees noted in ${summaryFile} (${treeFiles.length}) is inconsistend ` +
        `to the amount of files in ${statisticsDirectory} (${treeStrengths.length})`;
    }

    const trees = treeFiles.map((treeFile, index) => {
        const treeFilePath = path.resolve(statisticsDirectory, treeFile);
        const content = fs.readFileSync(treeFilePath, 'utf-8');
        const nodes = parseStatisticsContent(content);
        return {
            strength: treeStrengths[index],
            baseNode: transformNodes(nodes)
        }
    });

    return {
        strength: totalStrength,
        totalSamples: trees[0].baseNode.samples,
        correlationMatrix: correlationMatrix,
        trees: trees
    }
}

/**
 * Parses a given correlation matrix text to a two-dimensional array of floats
 * @param {string} text - correlation matrix text
 * @returns {number[][]}
 */
function parseCorrelationMatrix(text) {
    text = text.replace(/\[|\]/g, '');  // Remove [] brackets from string
    return text.split(';\n').map(line =>
        line.split(',').map(Number.parseFloat)
    );
}

/**
 * Parses a given tree statistics text file content into an internal tuple representation
 * @param {string} text - tree statistics text
 * @returns {number[][]}
 */
function parseStatisticsContent(text) {
    return text.trim().split('\n').map(line => {
        const fields = line.split(';');
        return [
            Number.parseInt(fields[0]),  // height
            Number.parseInt(fields[1]),  // samples
            Number.parseFloat(fields[2]),  // impurity
            Number.parseFloat(fields[9]),  // impurityDrop
            Number.parseInt(fields[3]),  // feature
        ]
    });
}

/**
 * Internal tree data structure
 * The methods branchify() and toBranch() are just messy workarounds and should be refactored at some point
 */
class TreeNode {
    constructor(height, samples, impurity, impurityDrop, feature, children = []) {
        this.height = height;
        this.samples = samples;
        this.impurity = impurity;
        this.impurityDrop = impurityDrop;
        this.feature = feature;
        this.children = children;
    }

    /** Adds a child node */
    add(node) {
        if(this.children.length >= 2) throw `Node ${this} already has two children`;
        this.children.push(node);
    }
}

/**
 * Messy function for transforming the list of node parameters to an actual tree data structure
 * @param {*} tree
 */
function transformNodes(nodes) {
    const baseNode = new TreeNode(...nodes[0]);
    let stack = [baseNode];

    for (let nodeParameters of nodes.slice(1)) {
        let latest = stack[stack.length - 1];
        const node = new TreeNode(...nodeParameters);

        if (node.height === latest.height + 1) ; else if (node.height === latest.height) {  // Sibling Node
            stack.pop();
        } else if (node.height < latest.height) {
            stack = stack.slice(0, node.height);
        } else {
            throw "No no no no no"
        }

        latest = stack[stack.length - 1];
        latest.add(node);
        stack.push(node);
    }

    return baseNode;
}

const colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["green", "red"]);

const arc = d3.arc().innerRadius(0);
const slice = d3Component.component("path")
    .render((selection, slice) => {
        selection
            .attr("d", arc(slice))
            .attr("fill", colorScale(slice.data.impurity))
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .attr("stroke-linejoin", "round");
    });
const pie = d3Component.component("g")
    .render((selection, {
        radius,
        slices,
    }) => {
        const d3Slices = d3.pie()
            .value(d => d.value)
            .sort((a, b) => a.impurity.localeCompare(b.impurity))
            (slices);
        arc.outerRadius(radius);
        selection
            .call(slice, d3Slices);
    });

const fs_writeFile = util.promisify(fs.writeFile);

({
    input: './src/main.js',
    output: {
        file: './dist/public/js/main.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        sass({
            output: './dist/public/css/style.css'
        })
    ]
});

async function runGui(args) {
    //await rollup.rollup(rollupOptions);  // TODO this is a build step!
    const {statisticsDir, summaryFile} = readData(args);
    const app = express();
    console.log("Starting server");
    app.get('/',     (req, res) => res.sendFile(path.join(path.resolve() + '/index.html')));
    app.get('/data', (req, res) => res.json(createForest(summaryFile, statisticsDir)));
    app.use(express.static('public'));
    app.listen(3000, () => console.log('GUI running at http://localhost:3000'));
}

function readData({data}) {
    const statisticsDir = path.join(path.resolve(data), 'statistics');
    const summaryFile = path.join(path.resolve(data), 'summary.txt');
    return {statisticsDir, summaryFile};
}

const argv = yargs
    .command(
        'cli <data>',
        'Command line interface to generate SVGs',
        yargs$$1 => yargs$$1
            .positional('data', {
                describe: 'Folder containing the forest data'
            })
            .options({
                "width": {
                    alias: "w",
                    describe: "Width of the SVG",
                    default: 800,
                    number: true,
                },
                "height": {
                    alias: "h",
                    describe: "Height of the SVG",
                    default: 800,
                    number: true,
                },
                "depth": {
                    alias: "d",
                    describe: "Maximal depth of the tree rendering. Cut of leaves are visualized via consolidation nodes.",
                    number: true,
                },
                "leaf-color": {
                    describe: "Color of the leaves. Either the leaf impurity or the class assigned to the leaf.",
                    choices: ["impurity", "class"],
                    default: "impurity",
                },
                "leaf-impurity-threshold": {
                    describe: "Between 0 and 1. By default the impurity is mapped from 0 to 1 on a linear color gradient between red and green. If you set this flag, everything below the provided threshold is visualized red and the gradient will be linear between <threshold> and 1",
                    implies: "leaf-color",
                    default: 0,
                    number: true,
                },
                "branch-color": {
                    describe: "Color of the branches. Either the node's impurity or the node's drop-of-impurity.",
                    choices: ["impurity", "impurity-drop"],
                    default: "impurity",
                },
                /*
                "branch-impurity-threshold": {
                    describe: "program specifications",
                    implies: "branch-color",
                    default: 0,
                    number: true,
                }*/
                // TODO threshold for impurity drop?
            }),
        function (argv) {
            console.log(argv);
        }
    )
    .command(
        "gui <data>",
        "Graphical User Interface",
        yargs$$1 => yargs$$1
            .positional('data', {
                describe: 'Folder containing the forest data'
            }),
        runGui
    )
    .help("help")
    .version("0.1.0")
    .argv;
//# sourceMappingURL=index.js.map
