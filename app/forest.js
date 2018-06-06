export default async function getForest() {
    const forest = await (await fetch("http://localhost:3000/data")).json();
    forest.trees.forEach(tree => transformNodesInPlace(tree));
    forest.totalSamples = forest.trees[0].baseNode.samples;
    return forest;
}

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