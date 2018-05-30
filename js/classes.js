/**
 * Internal tree data structure
 * The methods branchify() and toBranch() are just messy workarounds and should be refactored at some point
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
		this.index = index
		this.x = x
		this.y = y
		this.angle = angle
		this.length = length
		this.depth = depth
		this.parent = parent
	}

	// This function should rather return the node itself without references to child nodes
	// This function is used to construct a set of branches that are to render
	// - x and y are the start coordinates
	// - angle and length are used to draw the line
	// - samples are used for the thickness
	// - impurity is used for the color
	// - index, depth and parent are currently unused
	toBranch() {
		return {
			index: this.index,
			x: this.x,
			y: this.y,
			angle: this.angle,
			length: this.length,
			depth: this.depth,
			parent: this.parent,
			samples: this.samples,
			impurity: this.impurity
		}
	}
}