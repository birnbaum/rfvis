import * as d3 from "d3";
import {drawPie} from "./draw_pie.js";
import {branchMouseover, leafMouseover, mouseout} from "./sidebar_templates.js";
import {InternalNode, LeafNode} from "./TreeNodes";

export {drawTree, resetTree};

/**
 * Draws the visualization of a binary decision tree of the provided SVG
 * @param {Object} options - For details see generateTreeElements()
 */
function drawTree(options) {
    const {
        svg,
        tree,
        totalSamples,

        width,
        height,
        trunkLength,

        maxDepth,

        branchColor: branchColorType,
        leafColor: leafColorType,
        pathLeafID,
    } = options;

    const {
        branches,
        leafs,
        bunches,
    } = generateTreeElements(tree, totalSamples, maxDepth, width, height, trunkLength, pathLeafID);

    // Adapt SVG size
    svg.style("width", width + "px").style("height", height + "px");

    // Draw branches
    svg.selectAll('line')
        .data(branches)  // This is where we feed the data to the visualization
        .enter()
        .append('line')
        .attr('x1', d => d.x)
        .attr('y1', d => d.y)
        .attr('x2', d => d.x2)
        .attr('y2', d => d.y2)
        .style('stroke-width', d => branchThickness(d, "SAMPLES", totalSamples))
        .style('stroke', d => branchColor(branchColorType, d))
        //.attr('id', d => 'branch-' + d.index)  // This attr is currently not used
        .on("mouseover", branchMouseover)
        .on("mouseout", mouseout)
        .on("click", d => {
            resetTree(svg);
            const newOptions = Object.assign({}, options);
            newOptions.totalSamples = d.samples;
            newOptions.tree = Object.assign({}, options.tree);
            newOptions.tree.baseNode = d;
            drawTree(newOptions);
        });

    // Draw leafs
    svg.selectAll('circle')
        .data(leafs)  // This is where we feed the data to the visualization
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => leafSize(d, "SAMPLES", totalSamples))
        .style("fill", d => leafColor(leafColorType, d))
        .on("mouseover", leafMouseover)
        .on("mouseout", mouseout);

    for (const bunch of bunches) {
        drawPie(
            svg,
            bunch,
            leafSize(bunch, "SAMPLES", totalSamples),
            getHistogram(bunch.baseNode, leafColorType, true),
            getHistogram(bunch.baseNode, "BEST_CLASS", true)  // TODO inefficient
        );
    }
}

/**
 * Resets all elements currently plotted in the provided SVG
 * @param svg {Selection} - D3 selection of the target SVG
 */
function resetTree(svg) {
    svg.selectAll('line').remove();
    svg.selectAll('circle').remove();
    svg.selectAll('g').remove();
}

// Helper functions
const addBranchInformation = (treeNode, x, y, angle, length, depth) => {
    return Object.assign(treeNode, {
        x,
        y,
        x2: x + length * Math.sin(angle),
        y2: y - length * Math.cos(angle),
        angle,
        length,
        depth,
    })
};

/**
 * Computes all the elements necessary to plot a single binary decision tree.
 * @param tree {Tree} - Tree object which shall be processed
 * @param totalSamples {number} - Number of samples the tree was fitted on
 * @param maxDepth {number} - Max depth until the tree shall be rendered. Cut of branches are displayed as pie charts
 * @param width {number} - Width of the SVG
 * @param height {number} - Height of the SVG
 * @param trunkLength {number} - Length of the trunk which resembles the base node. All other branch lengths depend on
 *      this length.
 * @param maxShorteningFactor {number} - Maximum shortening factor of the branch length of two successive branches
 * @param minBranchLength {number} - Minimum branch length
 * @returns {{branches: Array, leafs: Array, bunches: Array}}
 */
function generateTreeElements(tree, totalSamples, maxDepth, width, height, trunkLength, pathLeafID,
    maxShorteningFactor = 0.9, minBranchLength = 4) {
    // TODO Improvement: These lists shouldn't contain new objects but pointers to the tree data structure nodes
    const branches = [];
    const leafs = [];
    const bunches = [];

    // recursive function that adds branch objects to "branches"
    function branch(node) {

        branches.push(node);

        if (node.depth === maxDepth - 1) {
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
    }

    const baseNode = addBranchInformation(tree.baseNode, width/2, height, 0, trunkLength, 0);

    if (pathLeafID !== null) {
        markPathElements([pathLeafID], baseNode);
    }

    branch(baseNode);

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
 * Walks the entire tree and returns all leaf nodes
 * @param node {InternalNode} - Base node of the tree
 * @returns {LeafNode[]} - List of all lead nodes of the tree
 */
function getLeafNodes(node) {
    const leafNodes = [];
    function searchLeafs(node) {
        if (node instanceof LeafNode) {
            leafNodes.push(node);
        } else {
            searchLeafs(node.children[0]);
            searchLeafs(node.children[1]);
        }
    }
    searchLeafs(node);
    return leafNodes;
}

function walkAndApply(node, fn) {
    fn(node);
    if (node instanceof InternalNode) {
        walkAndApply(node.children[0], fn);
        walkAndApply(node.children[1], fn);
    }
}

function markPathElements(leafIds, tree) {
    // Reset current tree
    walkAndApply(tree, (node => {
        node.selectedPathElement = false;
    }));

    const leafs = getLeafNodes(tree)
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

/**
 * Computes a histogram over the samples contained the leaf nodes of a sub branch
 * @param node {InternalNode} - Base node of the sub branch
 * @param type {string} - Type of property over which the histogram shall be computed.
 *      Can be either IMPURITY or BEST_CLASS.
 * @param weighted {boolean} - If false al leafs have the same cardinality. If true the leafs are weighted by the number
 *      of contained samples.
 * @returns {{value: number, color: string, sortKey: (number|string)}[]} - See drawPie() for more information
 */
function getHistogram(node, type, weighted) {
    const leafNodes = getLeafNodes(node);
    const histObj = {};
    if (type === "IMPURITY") {
        for (const leafNode of leafNodes) {
            const impurity = leafNode.impurity.toFixed(1); // Converting all impurities to strings with two decimal places
            const n = weighted ? leafNode.samples : 1;
            if (impurity in histObj) {
                histObj[impurity] += n;
            } else {
                histObj[impurity] = n;
            }
        }
        const ordered = [];
        Object.keys(histObj).sort().forEach(key => {
            const color = leafColor(type, {impurity: Number.parseFloat(key)});
            ordered.push({value: histObj[key], color: color, sortKey: key});
        });
        return ordered;
    }
    if (type === "BEST_CLASS") {
        for (const leafNode of leafNodes) {
            const n = weighted ? leafNode.bestClass.count : 1;
            if (leafNode.bestClass.name in histObj) {
                histObj[leafNode.bestClass.name][0] += n
            } else {
                histObj[leafNode.bestClass.name] = [n];
            }
            histObj[leafNode.bestClass.name][1] = leafNode.bestClass.color;
        }
        const ordered = [];
        Object.keys(histObj).sort().forEach(key => {
            const color = leafColor(type, {bestClass: {color: histObj[key][1]}});
            ordered.push({value: histObj[key][0], color: color, sortKey: key});
        });
        return ordered;
    }
    // TODO
    if (type === "PATH") {
        return [{value: 1, color: "rgba(0, 0, 0, 0.5)", sortKey: "0"}]
    }
}


/* --------------------- Mapping functions for properties on colors/thickness/size --------------------- */

function branchColor(type, branch) {
    if (type === "IMPURITY") {
        // Linear scale that maps impurity values from 0 to 1 to colors from "green" to "brown"
        return d3.scaleLinear()
            .domain([0, 1])
            .range(["green", "brown"])
            (branch.impurity);
    }
    if (type === "DROP_OF_IMPURITY") {
        return d3.scaleLinear()
            .domain([0, 1])
            .range(["red", "green"])
            (branch.impurityDrop);
    }
    if (type === "BLACK") {
        return "black";
    }
    if (type === "PATH") {
        if (branch.selectedPathElement) {
            return d3.rgb(255, 0, 0);
        } else {
            const c = d3.rgb(0, 0, 0);
            c.opacity = 0.5;
            return c;
        }
    }
    console.log(this);
    throw "Unsupported setting";
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
    if (type === "IMPURITY") {
        return d3.scaleLinear()
            .domain([0, 0.5, 1])
            .range(["green", "red", "red"])
            (leaf.impurity);
    }
    if (type === "BEST_CLASS") {
        return d3.rgb(...leaf.bestClass.color);
    }
    if (type === "PATH") {
        if (leaf.selectedPathElement) {
            return d3.rgb(255, 0, 0);
        } else {
            const c = d3.rgb(0, 0, 0);
            c.opacity = 0.5;
            return c;
        }
    }
    console.log(this);
    throw "Unsupported setting";
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