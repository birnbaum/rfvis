import * as path from "path";
import * as fs from "fs";

export default createForest;

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
function createForest(summaryFile, statisticsDirectory) {
    const summary = fs.readFileSync(summaryFile, 'utf-8');
    const summaryParts = summary.split('\n\n');

    const totalStrength = Number.parseFloat(summaryParts[0]);
    const correlationMatrix = parseCorrelationMatrix(summaryParts[2]);

    const treeFiles = fs.readdirSync(statisticsDirectory);
    const treeStrengths = summaryParts[1].split('\n').map(Number.parseFloat);

    // Sanity check
    if (treeFiles.length !== treeStrengths.length) {
        console.log(treeFiles, treeStrengths);
        console.log(treeFiles.length, treeStrengths.length);
        throw `Number of trees noted in ${summaryFile} (${treeFiles.length}) is inconsistend ` +
        `to the amount of files in ${statisticsDirectory} (${treeStrengths.length})`;
    }

    const trees = treeFiles.map((treeFile, index) => {
        const treeFilePath = path.resolve(statisticsDirectory, treeFile);
        const content = fs.readFileSync(treeFilePath, 'utf-8');
        return {
            strength: treeStrengths[index],
            nodes: parseStatisticsContent(content)
        }
    });
    trees.forEach(transformNodesInPlace);

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
    return text.trim().split('\n').map(line => {
        const fields = line.split(';');
        return [
            Number.parseInt(fields[0]),  // height
            Number.parseInt(fields[1]),  // samples
            Number.parseFloat(fields[2]),  // impurity
            Number.parseFloat(fields[9]),  // impurityDrop
            Number.parseInt(fields[3]),  // feature
        ]
    });
}



/**
 * Internal tree data structure
 * The methods branchify() and toBranch() are just messy workarounds and should be refactored at some point
 */
class TreeNode {
    constructor(height, samples, impurity, impurityDrop, feature) {
        this.height = height;
        this.samples = samples;
        this.impurity = impurity;
        this.impurityDrop = impurityDrop;
        this.feature = feature;
        this.children = [];
    }

    /**
     * Adds a child node
     */
    add(node) {
        if(this.children.length >= 2) throw `Node ${this} already has two children`;
        this.children.push(node);
    }

    /**
     * Adds branch information to the node
     */
    branchify(index, x, y, angle, length, depth, parent) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.x2 = x + length * Math.sin(angle);
        this.y2 = y - length * Math.cos(angle);
        this.angle = angle;
        this.length = length;
        this.depth = depth;
        this.parent = parent;
    }

    // This function should rather return the node itself without references to child nodes
    // This function is used to construct a set of branches that are to render
    // - x and y are the start coordinates
    // - angle and length are used to draw the line
    // - samples are used for the thickness
    // - impurity is used for the color
    // - index, depth and parent are currently unused
    toBranch() {
        const thisCopy = Object.assign({}, this);
        delete thisCopy.children;
        return thisCopy;
    }
}

/**
 * Messy function for transforming the list of node parameters to an actual tree data structure
 * @param {*} tree
 */
function transformNodesInPlace(tree) {

    const baseNode = new TreeNode(...tree.nodes[0]);
    let stack = [baseNode];

    for (let nodeParameters of tree.nodes.slice(1)) {
        // console.log(nodeParameters[0], "X".repeat(stack.length))
        let latest = stack[stack.length - 1];
        const node = new TreeNode(...nodeParameters);

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

    // Modify object inplace
    delete tree.nodes;
    tree.baseNode = baseNode;
}