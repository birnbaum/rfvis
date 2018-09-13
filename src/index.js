import yargs from "yargs";
import express from "express";
import {createForest} from "./parser.js";
import {readDataFolder} from "./read_data.js"
import * as path from "path";
import {drawTree} from "./draw_tree";
import {computeForestMap} from "./compute_coordinates";
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
                "branch-color": {
                    describe: "Color of the branches. Either the node impurity or the node drop-of-impurity.",
                    choices: ["impurity", "impurity-drop"],
                    default: "impurity",
                }
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
    const data = await readDataFolder(args.data);

    console.log("Starting server");
    const app = express();
    app.get("/",     (req, res) => res.sendFile(path.join(__dirname, "/index.html")));
    app.get("/data", (req, res) => res.json(data));
    app.get("/patches/:id", (req, res) => {
        console.log("Requested " + req.params.id);
        res.sendFile(path.join(args.data, "leafData", "tree-0_id-0--f0.png"));
    });

    app.use(express.static(path.join(__dirname, "public")));
    app.listen(args.port, () => console.log("GUI running at http://localhost:" + args.port));
}

/**
 * Produces a SVG file for each tree in the forest and stores them at the provided "out" folder
 */
async function runCli(args) {
    const rawData = await readDataFolder(args.data);
    const forest = createForest(rawData);
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
        const filePath = path.join(outDir, `tree-${index + 1}.svg`);
        fs.writeFile(filePath, d3n.svgString(), () => {
            console.log(`>> Exported "${filePath}"`);
        });
    }
}