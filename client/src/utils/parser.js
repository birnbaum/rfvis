import TreeNode from "./TreeNode";
import Papa from "papaparse";

/**
 * Internal representation of a binary decision tree
 * @typedef {Object} Tree
 * @property {number} error - Out-of-bad error of the tree. Between 0 and 1
 * @property {TreeNode} baseNode - X coordinate of the tree. Between 0 and N
 */

/**
 * Internal representation of a forest
 * @typedef {Object} Forest
 * @property {number} error - Validation error of the forest. Between 0 and 1
 * @property {number} n_samples - Number of samples the forest was fitted on
 * @property {number[][]} correlationMatrix - Correlation matrix of all the trees in the forest
 * @property {Tree[]} trees - List of all the trees in the forest
 */

/**
 * Reads and parses the provided txt files and returns an internal representation of the data
 *
 * @param {Object} forest - Raw content of input files
 * @returns {Forest}
 */
export default function createForest(forest) {
    forest.trees.forEach(tree => {
        const nodes = Papa.parse(tree.data, {
            dynamicTyping: true,
            header: true,
            skipEmptyLines: true,
        }).data.map(node => {
            const class_distribution = node.value
                .slice(1, -1)
                .split(",")
                .map(el => Number.parseInt(el));
            node.classDistribution = forest.classes.map((c, i) => {
                return Object.assign({}, c, {value: class_distribution[i]})
            });
            delete node.value;
            return new TreeNode(node);
        });
        delete tree.data;

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
                throw new Error("Malformed statistics content");
            }

            latest = stack[stack.length - 1];
            latest.addChild(node);
            stack.push(node);
        }

        tree.baseNode = baseNode;
        tree.nodes = nodes;
    });

    return forest;
}
