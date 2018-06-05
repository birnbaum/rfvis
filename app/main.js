"use strict";

import {getForest} from "./forest.js";

// Tree configuration
const da = 0.4; // Angle delta
const dl = 0.85; // Length delta (factor)
const maxDepth = 1000;


// Tree creation functions
function generateTreeElements(tree) {
	const branches = [];
	const leafs = [];

	const simpleStrategy = node => {
		const leftChild = node.children[0];
		const rightChild = node.children[1];
		return {leftChild, rightChild};
	}

	const mightyUpStrategy = node => {
		const firstBiggerThanSecond = (node.children[0].samples / node.samples) >= 0.5;
		const leftBound = node.angle < 0;
		let leftChild, rightChild;
		if (firstBiggerThanSecond && leftBound) {
			leftChild = node.children[1];
			rightChild = node.children[0];
		} else if (!firstBiggerThanSecond && leftBound) {
			leftChild = node.children[0];
			rightChild = node.children[1];
		} else if (firstBiggerThanSecond && !leftBound) {
			leftChild = node.children[0];
			rightChild = node.children[1];
		} else {
			leftChild = node.children[1];
			rightChild = node.children[0];
		}
		return {leftChild, rightChild};
	}

	// recursive function that adds branch objects to "branches"
	function branch(node) {
		if (node.depth === maxDepth) return;
		
		branches.push(node.toBranch());
		
		if (node.children.length === 0) {
			leafs.push({
				x: node.x2,
				y: node.y2,
				impurity: node.impurity,
				samples: node.samples
			})
			return;  // End of recursion
		}

		const {leftChild, rightChild} = simpleStrategy(node);

		if (leftChild !== undefined) {
			leftChild.branchify(branches.length, node.x2, node.y2, node.angle - da, node.length * dl, node.depth + 1, node.index);
			branch(leftChild);
		}
		if (rightChild !== undefined) {
			rightChild.branchify(branches.length, node.x2, node.y2, node.angle + da, node.length * dl, node.depth + 1, node.index);
			branch(rightChild);
		}
	}
	
	// Start parameters: Index=0; starting point at 500,600 (middle of bottom line); 0° angle; 100px long; no parent branch
	tree.baseNode.branchify(0, 500, 800, 0, 100, 0, null)
	branch(tree.baseNode);

	return {branches, leafs};
}


class TreeConfig {
	constructor({
		totalSamples,
		branchColor: _branchColor = "IMPURITY",
		branchThickness: _branchThickness = "SAMPLES",
		leafColor: _leafColor = "IMPURITY",
		leafSize: _leafSize = "SAMPLES",
	}) {
		this.totalSamples = totalSamples;
		this._branchColor = _branchColor;
		this._branchThickness = _branchThickness;
		this._leafColor = _leafColor;
		this._leafSize = _leafSize;
	}

	branchColor(branch) {
		if (this._branchColor === "IMPURITY") {
			// Linear scale that maps impurity values from 0 to 1 to colors from "green" to "brown"
			return d3.scaleLinear()
				.domain([0, 1])
				.range(["green", "brown"])
				(branch.impurity);
		}
		console.log(this);
		throw "Unsupported setting";
	}

	branchThickness(branch) {
		if (this._branchThickness === "SAMPLES") {
			// Linear scale that maps the number of samples in a branch to a certain number of pixels
			return d3.scaleLinear()
				.domain([1, this.totalSamples])
				.range([1, 15])
				(branch.samples) + 'px';
		}
		console.log(this);
		throw "Unsupported setting";
	}

	leafColor(leaf) {
		if (this._leafColor === "IMPURITY") {
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

	leafSize(leaf) {
		if (this._leafColor === "SAMPLES") {
			return d3.scaleLinear()
				.domain([1, 100])
				.range([1, 10])
				(leaf.samples)
		}
		console.log(this);
		throw "Unsupported setting";
	}
}


function drawTree(branches, leafs, config) {
	console.log(config)
	d3.select('#tree')
		.selectAll('line')
		.data(branches)  // This is where we feed the data to the visualization
		.enter()
		.append('line')
		.attr('x1', d => d.x)
		.attr('y1', d => d.y)
		.attr('x2', d => d.x2)
		.attr('y2', d => d.y2)
		.style('stroke-width', config.branchThickness)
		.style('stroke', config.branchColor)
		.attr('id', d => 'id-' + d.index);  // This attr is currently not used
	
	d3.select("#tree")
		.selectAll('circle')
		.data(leafs)  // This is where we feed the data to the visualization
		.enter()
		.append("circle")
		.attr("cx", d => d.x)
		.attr("cy", d => d.y)
		.attr("r", config.leafSize)
		.style("fill", config.leafColor);
}

function resetSvg() {
	d3.select('#tree').selectAll('line').remove();
	d3.select('#tree').selectAll('circle').remove();
}

(async function() {
	const forest = await getForest();

	function updateTreeVisualization(treeId) {
		resetSvg();
		const tree = forest.trees[treeId];
		const {branches, leafs} = generateTreeElements(tree);
		const config = new TreeConfig({totalSamples: forest.totalSamples})
		drawTree(branches, leafs, config);
	}

	let treeId = 0;
	updateTreeVisualization(treeId);

	d3.selectAll('.next').on('click', () => {
		if (treeId === forest.trees.length-1) return alert("Last");
		treeId++;
		updateTreeVisualization(treeId);
	});

	d3.selectAll('.previous').on('click', () => {
		if (treeId === 0) return alert("First");
		treeId--;
		updateTreeVisualization(treeId);
	});
})();
