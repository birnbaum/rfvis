import * as path from "path";
import * as fs from "fs";
import * as util from "util";
const fs_readFile = util.promisify(fs.readFile);


function readDataFolder(args) {
    const dataPath = path.resolve(args.data);
    const forestFile = path.join(dataPath, "statistics", "forest.txt");
    const forestFileContent = fs.readFileSync(forestFile, "utf8");

    const treeFileContentPromises = {};
    for (const file of fs.readdirSync(path.join(dataPath, "statistics"))) {
        if (!file.startsWith("tree")) continue;
        const id = Number.parseInt(file.split(".")[0].split("_")[1]);
        treeFileContentPromises[id] = fs_readFile(path.join(dataPath, "statistics", file), "utf8");
    }
    return Promise.all(Object.values(treeFileContentPromises))
        .then(treeFileContents => ({forestFileContent, treeFileContents}));
}

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
export default async function createForest(args) {
    const rawData = await readDataFolder(args);
    const forestDataParts = rawData.forestFileContent.split('\n\n');

    const correlationMatrix = parseCorrelationMatrix(forestDataParts[0]);
    const treeStrengths = forestDataParts[1].split('\n').map(Number.parseFloat);
    const totalStrength = Number.parseFloat(forestDataParts[2]);

    const trees = rawData.treeFileContents.map((treeFileContent, index) => {
        return {
            strength: treeStrengths[index],
            baseNode: parseStatisticsContent(treeFileContent)
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
    const lines = text.trim().split('\n').slice(2);
    const nodes = lines.map(line => {
        const fields = line.split(';');
        if (fields.length === 11) {
            return new InternalNode(fields)
        } else if (fields.length === 6) {
            return new LeafNode(fields)
        } else {
            throw "Unknown tree file format";
        }
    });

    const baseNode = nodes.shift();

    let stack = [baseNode];
    for (const node of nodes) {
        let latest = stack[stack.length - 1];

        if (node.height === latest.height + 1) {  // Child Node
            // Do nothing
        } else if (node.height === latest.height) {  // Sibling Node
            stack.pop();
        } else if (node.height < latest.height) {
            stack = stack.slice(0, node.height)
        } else {
            throw "No no no no no"
        }

        latest = stack[stack.length - 1];
        latest.add(node);
        stack.push(node);
    }

    return baseNode;
}

// height;  -; 0 (==split node); size; impurity; DoI; splitting grade; #used features, list of feature IDs; fusion ID; path prediction, split point def; #scores, list of score IDs
// 0; -; 0; 13361; 0.999982; 0.241935; 1.00015; 1, 0; 1; 2, median; 1, 2-misclass

/**
 * Internal tree data structure
 */
class InternalNode {
    constructor(fields) {
        this.height = Number.parseInt(fields[0]);
        this.samples = Number.parseInt(fields[3]);
        this.impurity = Number.parseFloat(fields[4]);
        this.impurityDrop = Number.parseFloat(fields[5]);
        this.children = [];
    }

    /** Adds a child node */
    add(node) {
        if(this.children.length >= 2) throw `Node ${this} already has two children`;
        this.children.push(node);
    }
}

class LeafNode {
    constructor(fields) {
        this.height = Number.parseInt(fields[0]);
        this.leafId = Number.parseInt(fields[1]);
        this.samples = Number.parseInt(fields[3]);
        this.impurity = Number.parseFloat(fields[4]);
        this.classFrequency = fields[5].split(",").map(c => Number.parseInt(c));
    }
}