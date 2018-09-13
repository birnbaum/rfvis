import {InternalNode, LeafNode} from "./TreeNodes";

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
            throw "Malformed statistics content";
        }

        latest = stack[stack.length - 1];
        latest.add(node);
        stack.push(node);
    }

    return baseNode;
}
