const yargs = require("yargs");
const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");
// import {createForest} from "./parser.js";
// import {drawTree} from "./draw_tree";
// import D3Node from "d3-node";

/**
 * This function initializes all CLI commands and processes them accordingly when the application is called
 */
const argv = yargs
    .scriptName("rfvis")
    /*
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
    )*/
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
                    default: 8080,
                    number: true,
                },
            }),
        runGui
    )
    .help("help")
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
    app.get("/",     (req, res) => res.sendFile(path.join(__dirname, "build", "/index.html")));
    app.get("/info", (req, res) => res.json({name: args.data}));
    app.get("/data", (req, res) => res.json(data));
    /* app.get("/patches/:id", (req, res) => {
        console.log("Requested " + req.params.id);
        res.sendFile(path.join(args.data, "leafData", "tree-0_id-0--f0.png"));
    }); */

    // app.use(express.static(path.join(__dirname, "public")));
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
        const filePath = path.join(outDir, `tree-${index}.svg`);
        fs.writeFile(filePath, d3n.svgString(), () => {
            console.log(`>> Exported "${filePath}"`);
        });
    }
}


/**
 * Reads the text files from the provided data folder
 * @param {string} dataFolder - Folder containing the forest data text files
 * @returns {Promise<{forestFileContent: string, treeFileContents: [string]}>}
 */
function readDataFolder(dataFolder) {
    const fs_readFile = util.promisify(fs.readFile);

    const dataPath = path.resolve(dataFolder);
    const forestFile = path.join(dataPath, "forest.txt");
    const forestFileContent = fs.readFileSync(forestFile, "utf8");

    const treeFileContentPromises = {};
    for (const file of fs.readdirSync(dataPath)) {
        if (file.startsWith("tree") && file.endsWith(".txt")) {
            const id = Number.parseInt(file.split(".")[0].split("_")[1]);
            treeFileContentPromises[id] = fs_readFile(path.join(dataPath, file), "utf8");
        }
    }
    return Promise.all(Object.values(treeFileContentPromises))
        .then(treeFileContents => ({forestFileContent, treeFileContents}));
}