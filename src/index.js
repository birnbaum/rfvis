import yargs from "yargs";
import express from "express";
import {createForest} from "./parser.js";
import * as path from "path";
import {drawTree} from "./draw_tree";
import D3Node from "d3-node";
import * as fs from "fs";
import * as child_process from "child_process";

/**
 * This function initializes all CLI commands and processes them accordingly when the application is called
 */
const argv = yargs
    .command(
        "cli <data>",
        "Command line interface to generate SVGs",
        yargs => yargs
            .positional("data", {
                describe: "Folder containing the forest data"
            })
            .options({
                "out": {
                    alias: "o",
                    describe: "Output folder for the SVG files. If omitted the current working directory is used.",
                },
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
                "trunk-length": {
                    alias: "l",
                    describe: "Length of the trunk which influences the entire tree size",
                    default: 100,
                    number: true,
                },
                "depth": {
                    alias: "d",
                    describe: "Depth of the tree rendering. Cut of leaves are visualized as pie chart consolidation nodes.",
                    number: true,
                },
                "leaf-color": {
                    describe: "Color of the leaves. Either the leaf impurity or the class assigned to the leaf.",
                    choices: ["impurity", "class"],
                    default: "impurity",
                },
                /*
                "leaf-impurity-threshold": {
                    describe: "Between 0 and 1. By default the impurity is mapped from 0 to 1 on a linear color gradient between red and green. If you set this flag, everything below the provided threshold is visualized red and the gradient will be linear between <threshold> and 1",
                    implies: "leaf-color",
                    default: 0,
                    number: true,
                },*/
                "branch-color": {
                    describe: "Color of the branches. Either the node impurity or the node drop-of-impurity.",
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
            .positional("data", {
                describe: "Folder containing the forest data"
            })
            .options({
                "port": {
                    alias: "p",
                    describe: "Port on which the server shall run on.",
                    default: 3000,
                    number: true,
                },
            }),
        runGui
    )
    .help("help")
    .version("0.1.0")
    .argv;

if (!argv._[0]) {
    yargs.showHelp();
}

/**
 * Starts a webserver serving the GUI
 */
async function runGui(args) {
    const forest = await createForest(args);

    // As the positions are computationally expensive, we start the calculation in a subprocess
    // and offer the HTTP endpoint "/positions" to poll the result periodically
    let positions = null;
    const computation_process = child_process.fork(path.join(__dirname, "_compute_coordinates.js"), [], {
        execArgv: []  // This flag is necessary to debug child processes in Webstorm
    });
    computation_process.on("message", result => {
        positions = result;
    });
    computation_process.on("error", console.error);
    computation_process.send(forest);


    console.log("Starting server");
    const app = express();
    app.get("/",     (req, res) => res.sendFile(path.join(__dirname, "/index.html")));
    app.get("/data", (req, res) => res.json(forest));
    app.get("/positions", (req, res) => {
        // If the positions are already created return them, otherwise return an Error
        if (positions) {
            res.json({progress: 100, positions: positions});
        } else {
            res.json({progress: 0, positions: []});
        }
    });

    app.use(express.static(path.join(__dirname, "public")));
    app.listen(args.port, () => console.log("GUI running at http://localhost:" + args.port));
}

/**
 * Produces a SVG file for each tree in the forest and stores them at the provided "out" folder
 */
async function runCli(args) {
    const forest = await createForest(args);
    const outDir = args.out ? path.resolve(args.out) : __dirname;
    if (!fs.existsSync(outDir)) throw `Output directory ${outDir} does not exist.`;

    for (const [index, tree] of forest.trees.entries()) {
        const d3n = new D3Node();
        const svg = d3n.createSVG(args.width, args.height).append("g");
        drawTree({
            svg: svg,
            tree: tree,
            totalSamples: forest.totalSamples,

            width: args.width,
            height: args.height,
            trunkLength: args.trunkLength,

            maxDepth: args.depth,

            branchColor: args.branchColor.toUpperCase(),
            leafColor: args.leafColor.toUpperCase()
        });
        const filePath = path.join(outDir, `tree-${index}.svg`);
        fs.writeFile(filePath, d3n.svgString(), () => {
            console.log(`>> Exported "${filePath}"`);
        });
    }
}