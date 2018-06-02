import {Node} from "./classes.js";
export {getForest};

async function getForest() {
    const forest = await (await fetch("http://localhost:3000/data")).json()
    forest.trees.forEach(tree => transformNodesInPlace(tree))
    forest.totalSamples = forest.trees[0].baseNode.samples;
    return forest;
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