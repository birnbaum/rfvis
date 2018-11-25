import yargs from "yargs";
import express from "express";
import path from "path";
import fs from "fs";
import util from "util";
import createForest from "./src/logic/parser";
import React from 'react';
import { renderToString } from 'react-dom/server';
import Tree from "./src/components/Tree";
import {BRANCH_COLORS, LEAF_COLORS} from "./src/constants";
import {InternalNode, LeafNode} from "./src/logic/TreeNodes";

/**
 * This function initializes all CLI commands and processes them accordingly when the application is called
 */
const argv = yargs
    .scriptName("rfvis")
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
                    default: 8080,
                    number: true,
                },
            }),
        runGui
    )
    .command(
        "export <data>",
        "Export to new data format",
        yargs => yargs
            .positional("data", {
                describe: "Folder containing the forest data"
            })
            .options({
                "out": {
                    alias: "o",
                    describe: "Output folder for the SVG files. If omitted the current working directory is used.",
                },
            }),
        exportData
    )
    .help("help")
    .argv;

if (!argv._[0]) { // TODO improve message
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
    app.get("/info", (req, res) => res.json({name: args.data}));
    app.get("/data", (req, res) => res.json(data));
    /* app.get("/patches/:id", (req, res) => {
        console.log("Requested " + req.params.id);
        res.sendFile(path.join(args.data, "leafData", "tree-0_id-0--f0.png"));
    }); */

    app.use(express.static(path.join(__dirname)));
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
        const body = renderToString(<Tree returnValidSVG={true}
                                          displayNode={tree.baseNode}
                                          displayDepth={args.depth || 10000}
                                          trunkLength={args.trunkLength}
                                          branchColor={BRANCH_COLORS[args.branchColor.toUpperCase()]}
                                          leafColor={LEAF_COLORS[args.leafColor.toUpperCase()]}
                                          width={args.width}
                                          height={args.height} />);

        const filePath = path.join(outDir, `tree-${index}.svg`);
        fs.writeFile(filePath, body, () => {
            console.log(`>> Exported "${filePath}"`);
        });
    }
}

/**
 * Produces a SVG file for each tree in the forest and stores them at the provided "out" folder
 */
async function exportData(args) {
    const rawData = await readDataFolder(args.data);
    const forest = createForest(rawData);
    const outDir = args.out ? path.resolve(args.out) : __dirname;
    if (!fs.existsSync(outDir)) throw `Output directory ${outDir} does not exist.`;

    const splitPath = args.data.split("\\");
    const outJson = {
        name: splitPath[splitPath.length-1],
        error: forest.error,
        n_samples: forest.totalSamples,
        criterion: "gini",
        correlationMatrix: forest.correlationMatrix,
        classes: [
            {
                name: "city",
                color: [0,0,255]
            },
            {
                name: "streets",
                color: [255,0,0]
            },
            {
                name: "forest",
                color: [0,128,0]
            },
            {
                name: "field",
                color: [0,255,255]
            },
            {
                name: "shrubland",
                color: [0,255,0]
            },
        ],
        trees: forest.trees.map((tree, i) => {
            const filename = `./tree-${i}.csv`;
            treeToCsv(tree, path.join(outDir, filename));
            return {
                error: tree.oobError,
                data: filename
            }
        })
    };

    const forestOutpath = path.join(outDir, "forest.json");
    fs.writeFile(forestOutpath, JSON.stringify(outJson, null, 2), 'utf8', (err) => {
        if (err) throw err;
        console.log(`Saved ${forestOutpath}`);
    });
}

function treeToCsv(tree, outpath) {
    propagateValue(tree.baseNode);

    let csv = "id,depth,n_node_samples,impurity,value\n";
    let id = 0;
    function walkTree(node) {
        csv += [
            id,
            node.depth,
            node.samples,
            node.impurity,
            `"[${node.value.join(",")}]"`,
            // node.impurityDrop
        ].join(",") + "\n";
        id++;
        if (node instanceof InternalNode) {
            walkTree(node.children[0]);
            walkTree(node.children[1]);
        }
    }

    walkTree(tree.baseNode);
    fs.writeFile(outpath, csv, 'utf8', (err) => {
        if (err) throw err;
        console.log(`Saved ${outpath}`);
    });
}

function propagateValue(node) {
    if (node.classes) {
        node.value = node.classes.map(cls => cls.count);
    } else {
        const leftValue = propagateValue(node.children[0]);
        const rightValue = propagateValue(node.children[1]);
        node.value = leftValue.map((left, i) => left + rightValue[i]);
    }
    return node.value;
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