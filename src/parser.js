import * as path from "path";
import * as fs from "fs";
import * as util from "util";
const fs_readFile = util.promisify(fs.readFile);


/**
 * Reads the text files from the provided data folder
 * @param {string} dataFolder - Folder containing the forest data text files
 * @returns {Promise<{forestFileContent: string, treeFileContents: [string]}>}
 */
function readDataFolder(dataFolder) {
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

/**
 * Reads the provided txt files and constructs a forest object of the following form:
 *  {
 *      strength: float,
 *      totalSamples: int,
 *      correlationMatrix: float[][],
 *      trees: {strength: float, baseNode: InternalNode}[]
 *  }
 *
 * @param {Object} args - User provided arguments
 * @returns {Object}
 */
export default async function createForest(args) {
    const rawData = await readDataFolder(args.data);
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
        trees: trees.slice(0, 15)
    };
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
 * Parses a given tree statistics text file content into an internal Node representation
 * @param {string} text - tree statistics text
 * @returns {InternalNode}
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

        const parts = fields[5].split(",").map(c => Number.parseInt(c));
        this.noClasses = parts[0];

        // TODO Currently hardcoded
        this.classes = [
            {
                name: "city",
                color: [0,0,255],
                count: parts[1]
            },
            {
                name: "streets",
                color: [255,0,0],
                count: parts[2]
            },
            {
                name: "forest",
                color: [0,128,0],
                count: parts[3]
            },
            {
                name: "field",
                color: [0,255,255],
                count: parts[4]
            },
            {
                name: "shrubland",
                color: [0,255,0],
                count: parts[5]
            },
        ];
        this.bestClass = getBestClass(this.classes);
    }
}

function getBestClass(classes) {
    let best;
    let indexOfBest;
    for (let i = 0; i < classes.length; i++) {
        if (!best || classes[i].count > best.count) {
            best = classes[i];
            indexOfBest = i;
        }
    }
    return classes[indexOfBest];
}
