export const setForest = forest => ({
    type: "SET_FOREST",
    forest
});

export const setCurrentTreeId = currentTreeId => ({
    type: "SET_CURRENT_TREE_ID",
    currentTreeId
});

export const incrementCurrentTreeId = () => ({
    type: "INCREMENT_CURRENT_TREE_ID"
});

export const decrementCurrentTreeId = () => ({
    type: "DECREMENT_CURRENT_TREE_ID"
});

export const setTrunkLength = trunkLength => ({
    type: "SET_TRUNK_LENGTH",
    trunkLength
});

export const setDisplayDepth = displayDepth => ({
    type: "SET_DISPLAY_DEPTH",
    displayDepth
});

export const resetDisplayDepth = () => ({
    type: "RESET_DISPLAY_DEPTH"
});

export const setLeafColor = leafColor => ({
    type: "SET_LEAF_COLOR",
    leafColor
});

export const setBranchColor = branchColor => ({
    type: "SET_BRANCH_COLOR",
    branchColor
});

export const setSelectedLeaf = selectedLeaf => ({
    type: "SET_SELECTED_LEAF",
    selectedLeaf
});

export const setColorTabIndex = colorTabIndex => ({
    type: "SET_COLOR_TAB_INDEX",
    colorTabIndex
});

export const setHoverState = (hoverType, hoverData) => ({
    type: "SET_HOVER_STATE",
    hoverType,
    hoverData
});

export const unsetHoverState = () => ({
    type: "UNSET_HOVER_STATE"
});