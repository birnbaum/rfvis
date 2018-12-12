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
        return tree.nodes.reduce((acc, node) => Math.max(acc, node.depth), 0);
    }
);

/**
 * Returns all leaf nodes in the currently selected tree
 * @param {Tree} tree
 * @returns {number}
 */
export const getLeafIds = createSelector(
    [getForest, getCurrentTreeId],
    (forest, currentTreeId) => {
        const tree = forest.trees[currentTreeId];
        return tree.nodes
            .filter(node => node.isLeaf())
            .map(node => node.id)
            .sort();
    }
);
