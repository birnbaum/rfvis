"use strict";

import {getForest} from "./forest.js";


// Tree configuration
const da = 0.4; // Angle delta
const dl = 0.85; // Length delta (factor)
const maxDepth = 1000;

let forest = null;
let treeId = 0;


// Tree creation functions
function generateBranches(tree) {
	const branches = [];
	const leafs = [];

	// recursive function that adds branch objects to "branches"
	function branch(node) {
		if (node.depth === maxDepth) return;
		
		const end = endPt(node);
		branches.push(node.toBranch());
		
		if (node.children.length === 0) {
			leafs.push({
				x: end.x,
				y: end.y,
				impurity: node.impurity,
				samples: node.samples
			})
			return;  // End of recursion
		}

		let leftChild, rightChild;
		leftChild = node.children[0];
		rightChild = node.children[1];

		// Strategy for always drawing the mightier branch towards the sky
		/*
		const firstBiggerThanSecond = (node.children[0].samples / node.samples) >= 0.5;
		const leftBound = node.angle < 0;
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
		}*/

		if (leftChild !== undefined) {
			leftChild.branchify(branches.length, end.x, end.y, node.angle - da, node.length * dl, node.depth + 1, node.index);
			branch(leftChild);
		}
		if (rightChild !== undefined) {
			rightChild.branchify(branches.length, end.x, end.y, node.angle + da, node.length * dl, node.depth + 1, node.index);
			branch(rightChild);
		}
	}
	// Start parameters: Index=0; starting point at 500,600 (middle of bottom line); 0° angle; 100px long; no parent branch
	tree.baseNode.branchify(0, 500, 800, 0, 100, 0, null)
	branch(tree.baseNode);

	return {branches, leafs};
}

function endPt(b) {
	// Return endpoint of branch
	const x = b.x + b.length * Math.sin( b.angle );
	const y = b.y - b.length * Math.cos( b.angle );
	return {x: x, y: y};
}

/*
function highlightParents(d) {  
	const colour = d3.event.type === 'mouseover' ? 'green' : color(d.d);
	const depth = d.d;
	for(const i = 0; i <= depth; i++) {
		d3.select('#id-'+parseInt(d.i)).style('stroke', colour);
		d = branches[d.parent];
	}	
}*/

// ------------------------------- //
// This is where the magic happens //
// ------------------------------- //
async function drawTree(update=false) {
	// TODO factor this out
	if (forest === null) {
		forest = await getForest();
	}
	const tree = forest.trees[treeId];
	const {branches, leafs} = generateBranches(tree);
	
	// Linear scale that maps impurity values from 0 to 1 to colors from "green" to "brown"
	const branchImpurityColor = d3.scaleLinear()
		.domain([0, 1])
		.range(["green", "brown"]);

	// Linear scale that maps the number of samples in a branch to a certain number of pixels
	const branchThickness = d3.scaleLinear()
		.domain([1, forest.totalSamples])
		.range([1, 15]);

	const leafImpurityColor = d3.scaleLinear()
		.domain([0, 0.5])
		.range(["green", "brown"]);
		
	const leafSize = d3.scaleLinear()
		.domain([1, 100])
		.range([1, 10]);



	// Clear previous tree
	if (update) {
		d3.select('#tree').selectAll('line').remove();
		d3.select('#tree').selectAll('circle').remove();
	}

	d3.select('#tree')
		.selectAll('line')
		.data(branches)  // This is where we feed the data to the visualization
		.enter()
		.append('line')
		.attr('x1', d => d.x)
		.attr('y1', d => d.y)
		.attr('x2', d => endPt(d).x)
		.attr('y2', d => endPt(d).y)
		.style('stroke-width', d => branchThickness(d.samples) + 'px')
		.style('stroke', d => branchImpurityColor(d.impurity))
		.attr('id', d => 'id-' + d.index);  // This attr is currently not used
	
	d3.select("#tree")
		.selectAll('circle')
		.data(leafs)  // This is where we feed the data to the visualization
		.enter()
		.append("circle")
		.attr("cx", d => d.x)
		.attr("cy", d => d.y)
		.attr("r", d => leafSize(d.samples))
		.style("fill", d => {
			if(d.impurity > 0.5) return "red";
			return leafImpurityColor(d.impurity)
		});
}

d3.selectAll('.next').on('click', () => {
	if (treeId === forest.trees.length-1) return alert("Last");
	treeId++;
	drawTree(true);
});

d3.selectAll('.previous').on('click', () => {
	if (treeId === 0) return alert("First");
	treeId--;
	drawTree(true);
});

drawTree();