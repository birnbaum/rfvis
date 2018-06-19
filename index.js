import yargs from "yargs";
import express from "express";
import createForest from "./src/parser.js";
import * as path from "path";
import {drawTree} from "./src/draw_tree";
import D3Node from "d3-node";
import * as fs from "fs";

async function runGui(args) {
    const forest = await createForest(args);
    const app = express();
    console.log("Starting server");
    app.get("/",     (req, res) => res.sendFile(path.join(__dirname, "/index.html")));
    app.get("/data", (req, res) => res.json(forest));
    app.use(express.static(path.join(__dirname, "public")));
    app.listen(3000, () => console.log("GUI running at http://localhost:3000"));
}

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
            branchLength: args.branchLength,

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
                    describe: "Output folder for the SVG files",
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
                "branch-length": {
                    alias: "b",
                    describe: "Length of the trunk which influences the entire tree size",
                    default: 100,
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
            .positional("data", {
                describe: "Folder containing the forest data"
            }),
        runGui
    )
    .help("help")
    .version("0.1.0")
    .argv;

if (!argv._[0]) {
    yargs.showHelp();
}