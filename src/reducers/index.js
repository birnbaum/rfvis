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
    let sss = combineReducers({
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

    const displayDepthRequiresUpdate = [
        'SET_CURRENT_TREE_ID',
        'INCREMENT_CURRENT_TREE_ID',
        'DECREMENT_CURRENT_TREE_ID',
        'RESET_DISPLAY_DEPTH'
    ].indexOf(action.type) > -1;

    const newState = Object.assign({}, sss);

    if (displayDepthRequiresUpdate) {

        switch (action.type) {
            case 'INCREMENT_CURRENT_TREE_ID':
                if (newState.currentTreeId === newState.forest.trees.length - 1) {
                    newState.currentTreeId = 0;
                } else {
                    newState.currentTreeId += 1;
                }
                break;
            case 'DECREMENT_CURRENT_TREE_ID':
                if (newState.currentTreeId === 0) {
                    newState.currentTreeId = newState.forest.trees.length - 1;
                } else {
                    newState.currentTreeId -= 1;
                }
        }
        newState.displayDepth = getMaxDepth(newState);
    }

    return newState;
};

export default rootReducer;
