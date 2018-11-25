import { createSelector } from 'reselect';

const getForest = state => state.forest;
const getCurrentTreeId = state => state.currentTreeId;

/**
 * Returns the maximal depth of the currently selected tree
 * @param {Tree} tree
 * @returns {number}
 */
export const getMaxDepth = createSelector(
    [getForest, getCurrentTreeId],
    (forest, currentTreeId) => {
        const tree = forest.trees[currentTreeId];
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
);