import yargs from "yargs";
import express from "express";
import createForest from "./src/prepare_data.js";
import writeSvgs from "./src/cli.js";
import rollup from "rollup";
import rollupOptions from "./rollup.frontend.js";
import * as path from "path";

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

async function runCli(args) {
//    writeSvgs(data);
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
        function (argv) {
            console.log(argv)
        }
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
