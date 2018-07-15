import * as path from "path";
import * as fs from "fs";
import * as util from "util";
import * as math from "mathjs";
import nj from "numjs";
const fs_readFile = util.promisify(fs.readFile);


function readDataFolder(args) {
    const dataPath = path.resolve(args.data);
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

    const forest = {
        strength: totalStrength,
        totalSamples: trees[0].baseNode.samples,
        correlationMatrix: correlationMatrix,
        trees: trees
    };

    return add2dPositions(forest)
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

function add2dPositions(forest) {
    const gaussian = math.matrix([[0.058750, 0.100669, 0.162991, 0.249352, 0.360448, 0.492325,
        0.635391, 0.774837, 0.892813, 0.972053, 1.000000, 0.972053,
        0.892813, 0.774837, 0.635391, 0.492325, 0.360448, 0.249352,
        0.162991, 0.100669, 0.058750]]);

    const argmax = arr => arr.indexOf(Math.max(...arr));

    console.time('Computing forest map');

    // ++++++++++++++++++++++

    const treeSim = forest.correlationMatrix;
    const treeStrength = forest.trees.map(tree => tree.strength);

    // produce toy data
    const numTrees = treeStrength.length;

    // init output
    let position = math.zeros(2, numTrees);

    // init voting spaces
    // init voting spaces
    let voting = math.zeros(100, 100, numTrees);

    // some pre-calculations
    const x = math.matrix(Array(100).fill().map(el => math.range(1, 101)));
    const y = math.transpose(x);
    const g = math.multiply(math.transpose(gaussian), gaussian);

    for (let t1 = 0; t1 < numTrees; t1++) {

        // find tree with current maximal strength
        const i = argmax(treeStrength);
        // if its the first tree, define position as center
        if (t1 === 0) {
            position = math.subset(position, math.index([0,1], i), [[50],[50]])
        } else {
            // else get current voting space of this tree
            const tmp = math.subset(voting, math.index(math.range(0, 100), math.range(0, 100), i));
            // find maximum in this space
            const pos = argmax(math.flatten(tmp)._data);

            // use one random entry of maxima as position
            // pos=pos(ceil(rand*numel(pos)));

            const ix = pos / 100;
            const iy = pos % 100;
            position = math.subset(position, math.index([0, 1], i), [[ix], [iy]])
        }
        for (let t = 0; t < numTrees; t++) {
            // skip current tree
            if (t === i) {
                continue;
            }

            // transform correlation into distance
            const d = (1-treeSim[i][t])/(1-0.5)*25+10;

            // produce voting image
            const r = math.sqrt(math.add(math.dotPow(math.subtract(x, position._data[0][i]), 2), math.dotPow(math.subtract(y, position._data[1][i]), 2)))
            // tmp = conv2(double(abs(r-d)<5),g,'same');
            const votingImage = math.number(math.smaller(math.abs(math.subtract(r, d)), 5))

            const paddedVotingImage = math.subset(math.zeros(120,120), math.index(math.range(10, 110), math.range(10, 110)), votingImage);

            const tmp = math.matrix(nj.array(paddedVotingImage._data).convolve(nj.array(g._data)).tolist());

            // vote
            const oldVotingImage = math.subset(voting, math.index(math.range(0, 100), math.range(0, 100), t));
            const newVotingImage = math.add(oldVotingImage, math.reshape(tmp, [100,100,1]));
            voting = math.subset(voting, math.index(math.range(0, 100), math.range(0, 100), t), newVotingImage)
        }
        // "delete" current tree from list
        treeStrength[i] = 0;
    }
    console.timeEnd('Computing forest map');

    forest.trees = forest.trees.map((tree, i) => {
        const c = math.subset(position, math.index([0, 1], i))._data;
        tree.x = c[0][0];
        tree.y = c[1][0];
        return tree;
    });
    return forest;
}