import * as d3 from "d3";
import {drawPie} from "./pie.mjs";

export {drawTree, resetTree};

function drawTree({
    svg,
    tree,
    totalSamples,

    width = 800,
    height = 800,

    maxDepth = Number.POSITIVE_INFINITY,

    branchColor: _branchColor = "IMPURITY",
    branchThickness: _branchThickness = "SAMPLES",
    leafColor: _leafColor = "IMPURITY",
    leafSize: _leafSize = "SAMPLES",
}) {
    const {
        branches,
        leafs,
        bunches,
    } = generateTreeElements(tree, totalSamples, maxDepth, width, height);

    // Adapt SVG size
    svg.style("width", width).style("height", height);

    // Draw branches
    svg.selectAll('line')
        .data(branches)  // This is where we feed the data to the visualization
        .enter()
        .append('line')
        .attr('x1', d => d.x)
        .attr('y1', d => d.y)
        .attr('x2', d => d.x2)
        .attr('y2', d => d.y2)
        .style('stroke-width', d => branchThickness(d, _branchThickness, totalSamples))
        .style('stroke', d => branchColor(d, _branchColor))
        .attr('id', d => 'branch-' + d.index);  // This attr is currently not used

    // Draw leafs
    svg.selectAll('circle')
        .data(leafs)  // This is where we feed the data to the visualization
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => leafSize(d, _leafSize, totalSamples))
        .style("fill", d => leafColor(d, _leafColor));

    for (const bunch of bunches) {
        drawPie(svg, bunch.x, bunch.y, leafSize(bunch, _leafSize, totalSamples), bunch.slices);
    }
}

function resetTree(svg) {
    svg.selectAll('line').remove();
    svg.selectAll('circle').remove();
    svg.selectAll('g').remove();
}

// Helper functions
const addBranchInformation = (treeNode, index, x, y, angle, length, depth, parent) => {
    return Object.assign(treeNode, {
        index,
        x,
        y,
        x2: x + length * Math.sin(angle),
        y2: y - length * Math.cos(angle),
        angle,
        length,
        depth,
        parent
    })
};

const removeChildReferences = (node) => {
    const nodeCopy = Object.assign({}, node);
    delete nodeCopy.children;
    return nodeCopy;
};

function generateTreeElements(tree, totalSamples, maxDepth, width, height) {
    const branches = [];
    const leafs = [];
    const bunches = [];

    // recursive function that adds branch objects to "branches"
    function branch(node) {

        branches.push(removeChildReferences(node));

        if (node.depth === maxDepth - 1) {
            const histogram = getLeafHistogram(node, true);
            bunches.push({
                x: node.x2,
                y: node.y2,
                slices: histogram,
                samples: node.samples
            });
            return;  // End of recursion
        }

        if (node.children.length === 0) {
            leafs.push({
                x: node.x2,
                y: node.y2,
                impurity: node.impurity,
                samples: node.samples
            });
            return;  // End of recursion
        }

        const leftChild = node.children[0];
        const rightChild = node.children[1];
        // TODO Logarithmic?
        const length1 = 4 + leftChild.samples / totalSamples * 100;
        const length2 = 4 + rightChild.samples / totalSamples * 100;

        const angle1 = node.angle - Math.abs(leftChild.samples / node.samples - 1);
        const angle2 = node.angle + Math.abs(rightChild.samples / node.samples - 1);

        if (leftChild !== undefined) {
            branch(addBranchInformation(leftChild, branches.length, node.x2, node.y2, angle1, length1, node.depth + 1, node.index));
        }
        if (rightChild !== undefined) {
            branch(addBranchInformation(rightChild, branches.length, node.x2, node.y2, angle2, length2, node.depth + 1, node.index));
        }
    }

    // Start parameters: Index=0; starting point at 500,600 (middle of bottom line); 0° angle; 100px long; no parent branch
    const baseNode = addBranchInformation(tree.baseNode, 0, width/2, height, 0, 120, 0, null);
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

function getLeafNodes(node) {
    const leafNodes = [];
    function searchLeafs(node) {
        if (node.children.length === 0) {
            leafNodes.push(node);
        } else {
            searchLeafs(node.children[0]);
            searchLeafs(node.children[1]);
        }
    }
    searchLeafs(node);
    return leafNodes;
}

function getLeafWeightedAverage(node) {
    const leafNodes = getLeafNodes(node);
    const leafImpuritiesAndSamples = leafNodes.map(leaf => ({impurity: leaf.impurity, samples: leaf.samples}));
    const weightedSum = leafImpuritiesAndSamples.reduce((acc, current) => acc + current.impurity * current.samples, 0);
    return weightedSum / leafNodes.length / node.samples;
}

function getLeafHistogram(node, weighted = false) {
    const leafNodes = getLeafNodes(node);
    const histObj = {};
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
        ordered.push({value: histObj[key], impurity: key});
    });
    return ordered;
}

/* ------- Tree mapping functions ------- */

function branchColor(branch, type) {
    if (type === "IMPURITY") {
        // Linear scale that maps impurity values from 0 to 1 to colors from "green" to "brown"
        return d3.scaleLinear()
            .domain([0, 1])
            .range(["green", "brown"])
            (branch.impurity);
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

function leafColor(leaf, type) {
    if (type === "IMPURITY") {
        if (leaf.impurity > 0.5) {
            return "red";
        } else {
            return d3.scaleLinear()
                .domain([0, 0.5])
                .range(["green", "red"])
                (leaf.impurity);
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