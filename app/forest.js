import {Node} from "./classes.js";
export {getForest};

async function getForest() {
    const client = new HttpClient();
    await client.get("http://localhost:3000/data", async res => {
        const forest = JSON.parse(res);
        forest.trees.forEach(tree => transformNodesInPlace(tree))
        forest.totalSamples = forest.trees[0].baseNode.samples;
        await forest;
    });
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

class HttpClient {
    get(aUrl, aCallback) {
        const anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}