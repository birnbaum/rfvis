export {createForest};


/**
 * Internal representation of a binary decision tree
 * @typedef {Object} Tree
 * @property {number} strength - Strength of the tree. Between 0 and 1
 * @property {InternalNode} baseNode - X coordinate of the tree. Between 0 and N
 */

/**
 * Internal representation of a forest
 * @typedef {Object} Forest
 * @property {number} strength - Strength of the forest. Between 0 and 1
 * @property {number} totalSamples - Number of samples the forest was fitted on
 * @property {number[][]} correlationMatrix - Correlation matrix of all the trees in the forest
 * @property {Tree[]} trees - List of all the trees in the forest
 */

/**
 * Reads and parses the provided txt files and returns an internal representation of the data TODO
 *
 * @param {Object} args - User provided arguments
 * @returns {Forest}
 */
function createForest(rawData) {
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

        if (node.depth === latest.depth + 1) {  // Child Node
            // Do nothing
        } else if (node.depth === latest.depth) {  // Sibling Node
            stack.pop();
        } else if (node.depth < latest.depth) {
            stack = stack.slice(0, node.depth)
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
        this.depth = Number.parseInt(fields[0]);
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
        this.depth = Number.parseInt(fields[0]);
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
