import yargs from "yargs";
import express from "express";
import createForest from "./src/prepare_data.js";
import * as path from "path";
import {drawTree} from "./src/draw_tree";
import D3Node from "d3-node";
import * as fs from "fs";

function runGui(args) {
    //await rollup.rollup(rollupOptions);  // TODO this is a build step!
    const forest = readForest(args);
    const app = express();
    console.log("Starting server");
    app.get('/',     (req, res) => res.sendFile(path.join(path.resolve() + '/index.html')));
    app.get('/data', (req, res) => res.json(forest));
    app.use(express.static('public'));
    app.listen(3000, () => console.log('GUI running at http://localhost:3000'));
}

function runCli(args) {
    const forest = readForest(args);

    const width = 800;
    const height = 800;

    for (const [index, tree] of forest.trees.entries()) {
        const d3n = new D3Node();
        const svg = d3n.createSVG(width, height).append("g");
        drawTree({
            svg: svg,
            tree: tree,
            totalSamples: forest.totalSamples
        });
        const fileName = `tree-${index}.svg`;
        fs.writeFile(fileName, d3n.svgString(), () => {
            console.log(`>> Exported "${fileName}"`);
        });
    }


}

function readForest({data}) {
    const statisticsDir = path.join(path.resolve(data), 'statistics');
    const summaryFile = path.join(path.resolve(data), 'summary.txt');
    return createForest(summaryFile, statisticsDir);
}

const argv = yargs
    .command(
        'cli <data>',
        'Command line interface to generate SVGs',
        yargs => yargs
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
        runCli
    )
    .command(
        "gui <data>",
        "Graphical User Interface",
        yargs => yargs
            .positional('data', {
                describe: 'Folder containing the forest data'
            }),
        runGui
    )
    .help("help")
    .version("0.1.0")
    .argv;
