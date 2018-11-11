import {combineReducers} from "redux";
import {BRANCH_COLORS, LEAF_COLORS, DEFAULT_TRUNK_LENGTH} from "../constants"

const forest = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FOREST':
            return action.forest;
        default:
            return state
    }
};

const currentTreeId = (state = 0, action) => {
    switch (action.type) {
        case 'SET_CURRENT_TREE_ID':
            return action.currentTreeId;
        default:
            return state
    }
};

const trunkLength = (state = DEFAULT_TRUNK_LENGTH, action) => {
    switch (action.type) {
        case 'SET_TRUNK_LENGTH':
            return action.trunkLength;
        default:
            return state
    }
};

const displayDepth = (state = 0, action) => {
    switch (action.type) {
        case 'SET_DISPLAY_DEPTH':
            return action.displayDepth;
        default:
            return state
    }
};

const maxDepth = (state = 0, action) => {
    switch (action.type) {
        case 'SET_MAX_DEPTH':
            return action.maxDepth;
        default:
            return state
    }
};

const leafColor = (state = LEAF_COLORS.IMPURITY, action) => {
    switch (action.type) {
        case 'SET_LEAF_COLOR':
            return action.leafColor;
        default:
            return state
    }
};

const branchColor = (state = BRANCH_COLORS.IMPURITY, action) => {
    switch (action.type) {
        case 'SET_BRANCH_COLOR':
            return action.branchColor;
        default:
            return state
    }
};

const rootReducer = combineReducers({
    forest,
    currentTreeId,
    trunkLength,
    displayDepth,
    maxDepth,
    leafColor,
    branchColor,
});

export default rootReducer;
