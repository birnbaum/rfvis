import * as d3 from "d3";
import {LeafNode, InternalNode} from "./TreeNodes";
import {LEAF_COLORS, BRANCH_COLORS} from "../constants";

export {
    generateTreeElements,
    branchThickness,
    branchColor,
    leafSize,
    leafColor,
}

/**
 * Computes all the elements necessary to plot a single binary decision tree.
 * @param tree {Tree} - Tree object which shall be processed  TODO changed to baseNode
 * @param displayDepth {number} - Depth until the tree shall be rendered. Cut of branches are displayed as pie charts
 * @param width {number} - Width of the SVG
 * @param height {number} - Height of the SVG
 * @param trunkLength {number} - Length of the trunk which resembles the base node. All other branch lengths depend on
 *      this length.
 * @param maxShorteningFactor {number} - Maximum shortening factor of the branch length of two successive branches
 * @param minBranchLength {number} - Minimum branch length
 * @returns {{branches: Array, leafs: Array, bunches: Array}}
 */
function generateTreeElements(baseNode, displayDepth, width, height, trunkLength, pathLeafID,
    maxShorteningFactor = 0.9, minBranchLength = 4) {
    // TODO Improvement: These lists shouldn't contain new objects but pointers to the tree data structure nodes
    const branches = [];
    const leafs = [];
    const bunches = [];

    // recursive function that adds branch objects to "branches"
    const branch = (node) => {

        branches.push(node);

        if (node.depth === displayDepth - 1) {
            bunches.push({
                x: node.x2,
                y: node.y2,
                baseNode: node,
                samples: node.samples,
            });
            return;  // End of recursion
        }

        if (node instanceof LeafNode) {
            leafs.push({
                x: node.x2,
                y: node.y2,
                impurity: node.impurity,
                samples: node.samples,
                leafId: node.leafId,
                depth: node.depth,
                noClasses: node.noClasses,
                classes: node.classes,
                bestClass: node.bestClass,
                selectedPathElement: node.selectedPathElement,
            });
            return;  // End of recursion
        }

        const leftChild = node.children[0];
        const rightChild = node.children[1];

        const length1 = Math.max(Math.min(leftChild.samples / node.samples, maxShorteningFactor) * node.length, minBranchLength);
        const length2 = Math.max(Math.min(rightChild.samples / node.samples, maxShorteningFactor) * node.length, minBranchLength);

        const angle1 = node.angle - Math.abs(leftChild.samples / node.samples - 1);
        const angle2 = node.angle + Math.abs(rightChild.samples / node.samples - 1);

        if (leftChild !== undefined) {
            branch(addBranchInformation(leftChild, node.x2, node.y2, angle1, length1, node.depth + 1));
        }
        if (rightChild !== undefined) {
            branch(addBranchInformation(rightChild, node.x2, node.y2, angle2, length2, node.depth + 1));
        }
    };

    const extendedBaseNode = addBranchInformation(baseNode, width/ 2, height, 0, trunkLength, 0);

    if (pathLeafID !== null) {
        // this.markPathElements([pathLeafID], displayNode);
    }

    branch(extendedBaseNode);

    const sortBySamples = (a,b) => {
        if (a.samples > b.samples) return -1;
        if (a.samples < b.samples) return 1;
        return 0;
    };
    leafs.sort(sortBySamples);
    bunches.sort(sortBySamples);

    return {branches, leafs, bunches};
}

/**
 * Walks down a tree (depth first) and applies a function to each node
 * @param {InternalNode | LeafNode} node - Base node
 * @param {function} fn - function which shall be executed on each node
 */
function walkAndApply(node, fn) {
    fn(node);
    if (node instanceof InternalNode) {
        walkAndApply(node.children[0], fn);
        walkAndApply(node.children[1], fn);
    }
}

/**
 * Marks the provided leaf nodes and all of their parent nodes with a flag.
 * This function works in-place.
 *
 * @param {number[]} leafIds - List of leaf IDs
 * @param {InternalNode} tree - Tree on which the marking shall be performed
 */
function markPathElements(leafIds, tree) {
    // Reset current tree
    walkAndApply(tree, (node => {
        node.selectedPathElement = false;
    }));

    const leafs = this.getLeafNodes(tree)
        .filter(leaf => leafIds.includes(leaf.leafId));

    function walkUpAndApply(node, fn) {
        fn(node);
        if (node.parent) {
            walkUpAndApply(node.parent, fn);
        }
    }

    for (const leaf of leafs) {
        walkUpAndApply(leaf, node => {
            node.selectedPathElement = true;
        })
    }
}


/* --------------------- Mapping functions for properties on colors/thickness/size --------------------- */

function branchColor(type, branch) {
    if (type === BRANCH_COLORS.IMPURITY) {
        // Linear scale that maps impurity values from 0 to 1 to colors from "green" to "brown"
        return d3.scaleLinear()
            .domain([0, 1])
            .range(["green", "brown"])
            (branch.impurity);
    }
    if (type === BRANCH_COLORS.DROP_OF_IMPURITY) {
        return d3.scaleLinear()
            .domain([0, 1])
            .range(["red", "green"])
            (branch.impurityDrop);
    }
    if (type === BRANCH_COLORS.BLACK) {
        return "black";
    }
    if (type === "PATH") {  // TODO
        if (branch.selectedPathElement) {
            return d3.rgb(255, 0, 0);
        } else {
            const c = d3.rgb(0, 0, 0);
            c.opacity = 0.5;
            return c;
        }
    }
    throw new Error(`Unsupported branch color type "${type}"`);
}

function branchThickness(branch, type, totalSamples) {
    if (type === "SAMPLES") {
        // Linear scale that maps the number of samples in a branch to a certain number of pixels
        return d3.scaleLinear()
            .domain([1, totalSamples])
            .range([1, 15])
            (branch.samples) + 'px';
    }
    console.log(this);
    throw "Unsupported setting";
}

function leafColor(type, leaf) {
    if (type === LEAF_COLORS.IMPURITY) {
        return d3.scaleLinear()
            .domain([0, 0.5, 1])
            .range(["green", "red", "red"])
            (leaf.impurity);
    }
    if (type === LEAF_COLORS.BEST_CLASS) {
        return d3.rgb(...leaf.bestClass.color);
    }
    if (type === LEAF_COLORS.BLACK) {
        return "black";
    }
    if (type === "PATH") {  // TODO
        if (leaf.selectedPathElement) {
            return d3.rgb(255, 0, 0);
        } else {
            const c = d3.rgb(0, 0, 0);
            c.opacity = 0.5;
            return c;
        }
    }
    throw new Error(`Unsupported leaf color type "${type}"`);
}

function leafSize(leaf, type, totalSamples) {
    const maxRadius = Math.sqrt(totalSamples / Math.PI);
    const radius = Math.sqrt(leaf.samples / Math.PI);
    if (type === "SAMPLES") {
        return d3.scaleLinear()
            .domain([1, maxRadius])
            .range([1, 100])
            (radius)
    }
    console.log(this);
    throw "Unsupported setting";
}

function addBranchInformation(treeNode, x, y, angle, length, depth) {
    return Object.assign(treeNode, {
        x,
        y,
        x2: x + length * Math.sin(angle),
        y2: y - length * Math.cos(angle),
        angle,
        length,
        depth,
    })
}