"use strict";

// Tree configuration
const da = 0.5; // Angle delta
const dl = 0.85; // Length delta (factor)
const ar = 0.7; // Randomness
const maxDepth = 20;

function main() {
	const forest = loadForest();
	const tree = forest.trees[0];
	const branches = generateBranches(tree);
	draw(branches);
}

function loadForest() {
	// Here is the only point we access the hacky global variable FOREST
	FOREST.trees.forEach(tree => transformNodesInPlace(tree))
	return FOREST;
}

/**
 * Internal tree data structure
 */
class Node {
	constructor(height, samples, impurity, impurityDrop, feature) {
		this.height = height;
		this.samples = samples;
		this.impurity = impurity;
		this.impurityDrop = impurityDrop; 
		this.feature = feature;
		this.children = [];
	}

	add(node) {
		if(this.children.length >= 2) throw `Node ${this} already has two children`;
		this.children.push(node);
	}

	branchify(index, x, y, angle, length, depth, parent) {
		this.index = index
		this.x = x
		this.y = y
		this.angle = angle
		this.length = length
		this.depth = depth
		this.parent = parent
	}

	toBranch() {
		return {
			index: this.index,
			x: this.x,
			y: this.y,
			angle: this.angle,
			length: this.length,
			depth: this.depth,
			parent: this.parent,

		}
	}
}

/**
 * Messy function for transforming the list of node parameters to an actuall tree data structure
 * @param {*} tree 
 */
function transformNodesInPlace(tree) {

    const baseNode = new Node(...tree.nodes[0]);
    let stack = [baseNode];

    for (let nodeParameters of tree.nodes.slice(1)) {
        // console.log(nodeParameters[0], "X".repeat(stack.length))
        let latest = stack[stack.length - 1];
        const node = new Node(...nodeParameters);
    
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

///////////////////////

// Tree creation functions
function generateBranches(tree) {
	const branches = [];

	// recursive function
	function branch(node) {
		if (node.depth === maxDepth)
			return;
		
		const end = endPt(node);

		branches.push(node.toBranch());

		const leftChild = node.children[0];
		if (leftChild !== undefined) {
			leftChild.branchify(branches.length, end.x, end.y, node.angle - da, node.length * dl, node.depth + 1, node.index);
			branch(leftChild);
		}

		const rightChild = node.children[1];
		if (rightChild !== undefined) {
			rightChild.branchify(branches.length, end.x, end.y, node.angle + da, node.length * dl, node.depth + 1, node.index);
			branch(rightChild);
		}
	}
	
	tree.baseNode.branchify(0, 500, 600, 0, 100, 0, null)
	branch(tree.baseNode);

	return branches;
}

function endPt(b) {
	// Return endpoint of branch
	const x = b.x + b.length * Math.sin( b.angle );
	const y = b.y - b.length * Math.cos( b.angle );
	return {x: x, y: y};
}

// D3 functions
const color = d3.scaleLinear()
    .domain([0, maxDepth])
    .range(["black","purple"]);

// D3 functions
const color = d3.scaleLinear()
    .domain([0, maxDepth])
    .range(["black","purple"]);

/*
function highlightParents(d) {  
	const colour = d3.event.type === 'mouseover' ? 'green' : color(d.d);
	const depth = d.d;
	for(const i = 0; i <= depth; i++) {
		d3.select('#id-'+parseInt(d.i)).style('stroke', colour);
		d = branches[d.parent];
	}	
}*/

function draw(branches) {
	d3.select('svg')
		.selectAll('line')
		.data(branches)
		.enter()
		.append('line')
		.attr('x1', d => d.x)
		.attr('y1', d => d.y)
		.attr('x2', d => endPt(d).x)
		.attr('y2', d => endPt(d).y)
		.style('stroke-width', function(d) {
        const t = parseInt(maxDepth*.2 +1 - d.depth*.2);
        return  t + 'px';
    })
  	.style('stroke', function(d) {
        return color(d.depth);
    })
		.attr('id', function(d) {return 'id-'+d.index;});
}

main();
