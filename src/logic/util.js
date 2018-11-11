/**
 * Finds the maximal depth of a tree
 * @param {Tree} tree
 * @returns {number}
 */
export function getMaxDepth(tree) {  // TODO location
    let maxDepth = 0;
    function findMaxDepth(node) {
        if (node.children) {
            findMaxDepth(node.children[0]);
            findMaxDepth(node.children[1]);
        } else if (node.depth > maxDepth) {
            maxDepth = node.depth;
        }
    }
    findMaxDepth(tree.baseNode);
    return maxDepth + 1;
}
