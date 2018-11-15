import { connect } from 'react-redux';
import {TreeNode} from "../logic/TreeNodes";
import PropTypes from "prop-types";
import React from "react";
import {setHoverState, unsetHoverState} from "../actions";
import DownloadButton from "../components/DownloadButton";
import Tree from "../components/Tree";


class TreeView extends React.Component {
    static propTypes = {
        tree: PropTypes.shape({
            oobError: PropTypes.number.isRequired,
            baseNode: function(props, propName, componentName) {
                if (!(props[propName] instanceof TreeNode)) {
                    return new Error(`Validation failed: ${componentName}.${propName} not of type TreeNode`);
                }
            },
        }).isRequired,
        displayDepth: PropTypes.number.isRequired,
        trunkLength: PropTypes.number.isRequired,
        branchColor: PropTypes.string.isRequired,
        leafColor: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,

        hoverBranch: PropTypes.func.isRequired,
        hoverLeaf: PropTypes.func.isRequired,
        hoverBunch: PropTypes.func.isRequired,
        unhover: PropTypes.func.isRequired,
    };

    baseNode = null;
    displayNode = null;

    componentDidMount() {
        // TODO This is a little hacky
        this.baseNode = this.props.tree.baseNode;
        this.displayNode = this.props.tree.baseNode;
    }

    shouldComponentUpdate() {
        // TODO This is a little hacky
        this.baseNode = this.props.tree.baseNode;
        this.displayNode = this.props.tree.baseNode;
        return true;
    }

    render() {
        if (!this.displayNode) {
            return <span>Loading...</span>;
        }

        // TODO improve DownloadButton filename
        return (
            <div id="content">
                <div className="TreeView">
                    <Tree displayNode={this.displayNode}
                          displayDepth={this.props.displayDepth}
                          trunkLength={this.props.trunkLength}
                          branchColor={this.props.branchColor}
                          leafColor={this.props.leafColor}
                          width={this.props.width}
                          height={this.props.height}
                          renderSubtree={this.renderSubtree}
                          hoverBranch={this.props.hoverBranch}
                          hoverLeaf={this.props.hoverLeaf}
                          hoverBunch={this.props.hoverBunch}
                          unhover={this.props.unhover}/>

                    <span className="ResetZoomButton button is-small">
                        <span className="icon">
                            <i className="fas fa-undo" />
                        </span>
                        <span onClick={this.renderBaseTree}>Reset Zoom</span>
                    </span>

                    <DownloadButton filename={`tree.svg`}
                                    svgId={"tree"} />
                </div>
            </div>
        );
    }

    renderSubtree = node => {
        this.displayNode = node;
        this.forceUpdate();
    };

    renderBaseTree = () => {
        this.displayNode = this.baseNode;
        this.forceUpdate();
    };
}

const mapStateToProps = (state, ownProps) => ({
    tree: state.forest.trees[state.currentTreeId],
    displayDepth: state.displayDepth,
    trunkLength: state.trunkLength,
    branchColor: state.branchColor,
    leafColor: state.leafColor,
    width: 800,  // TODO make dynamic
    height: 800,  // TODO make dynamic
});


const mapDispatchToProps = (dispatch, ownProps) => {
    let hoverTimer = null;
    function postponeDispatch(action) {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
            dispatch(action)
        }, 100)
    }

    return {
        hoverBranch: branch => postponeDispatch(setHoverState("BRANCH", branch)),
        hoverLeaf: leaf => postponeDispatch(setHoverState("LEAF", leaf)),
        hoverBunch: bunch => postponeDispatch(setHoverState("BUNCH", bunch)),
        unhover: () => postponeDispatch(unsetHoverState()),
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TreeView)