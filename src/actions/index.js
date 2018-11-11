export const setForest = forest => ({
    type: 'SET_FOREST',
    forest
});

export const setCurrentTreeId = currentTreeId => ({
    type: 'SET_CURRENT_TREE_ID',
    currentTreeId
});

export const setTrunkLength = trunkLength => ({
    type: 'SET_TRUNK_LENGTH',
    trunkLength
});

export const setDisplayDepth = displayDepth => ({
    type: 'SET_DISPLAY_DEPTH',
    displayDepth
});

export const setMaxDepth = maxDepth => ({
    type: 'SET_MAX_DEPTH',
    maxDepth
});


export const setLeafColor = leafColor => ({
    type: 'SET_LEAF_COLOR',
    leafColor
});

export const setBranchColor = branchColor => ({
    type: 'SET_BRANCH_COLOR',
    branchColor
});
