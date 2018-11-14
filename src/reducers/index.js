import {combineReducers} from "redux";
import {BRANCH_COLORS, LEAF_COLORS, DEFAULT_TRUNK_LENGTH} from "../constants"
import {getMaxDepth} from "../selectors";

const title = (state = "", action) => {
    switch (action.type) {
        case 'SET_TITLE':
            return action.title;
        default:
            return state
    }
};

const forest = (state = null, action) => {
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
        case 'INCREMENT_CURRENT_TREE_ID':
            if (state.currentTreeId === state.forest.trees.length - 1) {
                return 0;
            } else {
                return state.currentTreeId + 1;
            }
        case 'DECREMENT_CURRENT_TREE_ID':
            if (state.currentTreeId === 0) {
                return state.forest.trees.length - 1;
            } else {
                return state.currentTreeId - 1;
            }
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

const hoverType = (state = null, action) => {
    switch (action.type) {
        case 'SET_HOVER_STATE':
            return action.hoverType;
        case 'UNSET_HOVER_STATE':
            return null;
        default:
            return state
    }
};

const hoverData = (state = null, action) => {
    switch (action.type) {
        case 'SET_HOVER_STATE':
            return action.hoverData;
        case 'UNSET_HOVER_STATE':
            return null;
        default:
            return state
    }
};

const rootReducer = (state = {}, action) => {
    let newState = combineReducers({
        title,
        forest,
        currentTreeId,
        trunkLength,
        displayDepth,
        leafColor,
        branchColor,
        hoverType,
        hoverData
    })(state, action);
    if (action.type === 'SET_CURRENT_TREE_ID' ||
        action.type === 'RESET_DISPLAY_DEPTH') {
        newState.displayDepth = getMaxDepth(state);
    }
    return newState;
};

export default rootReducer;
