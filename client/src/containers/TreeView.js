import { connect } from 'react-redux';
import PropTypes from "prop-types";
import React from "react";
import {setHoverState, unsetHoverState} from "../actions";
import DownloadButton from "../components/DownloadButton";
import Tree from "../components/Tree";


class TreeView extends React.Component {
    static propTypes = {
        baseNode: PropTypes.any.isRequired,
        displayDepth: PropTypes.number.isRequired,
        trunkLength: PropTypes.number.isRequired,
        branchColor: PropTypes.string.isRequired,
        leafColor: PropTypes.string.isRequired,
        selectedLeaf: PropTypes.number,

        hoverBranch: PropTypes.func.isRequired,
        hoverLeaf: PropTypes.func.isRequired,
        hoverBunch: PropTypes.func.isRequired,
        unhover: PropTypes.func.isRequired,
    };

    state = {
        baseNode: this.props.baseNode,
        displayNode: this.props.baseNode,
    };

    static getDerivedStateFromProps(props, state) {
        if (props.baseNode !== state.baseNode) {
            return {
                baseNode: props.baseNode,
                displayNode: props.baseNode
            };
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.displayNode.impurityDrop === this.state.displayNode.impurityDrop &&
            nextProps.displayDepth === this.props.displayDepth &&
            nextProps.trunkLength === this.props.trunkLength &&
            nextProps.branchColor === this.props.branchColor &&
            nextProps.leafColor === this.props.leafColor &&
            nextProps.selectedLeaf === this.props.selectedLeaf) {
            return false;
        }
        return true;
    }

    render() {
        if (!this.state.displayNode) {
            return <span>Loading...</span>;
        }

        const treeSvgWidth = Math.max(500, window.innerWidth - 632);
        const treeSvgHeight = Math.max(500, window.innerHeight - 45);

        // TODO improve DownloadButton filename
        return (
            <div id="content">
                <div className="TreeView">
                    <Tree displayNode={this.state.displayNode}
                          displayDepth={this.props.displayDepth}
                          trunkLength={this.props.trunkLength}
                          branchColor={this.props.branchColor}
                          leafColor={this.props.leafColor}
                          selectedLeaf={this.props.selectedLeaf}
                          width={treeSvgWidth}
                          height={treeSvgHeight}
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
        this.setState({displayNode: node});
    };

    renderBaseTree = () => {
        this.setState({displayNode: this.state.baseNode});
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        baseNode: state.forest.trees[state.currentTreeId].baseNode,
        displayDepth: state.displayDepth,
        trunkLength: state.trunkLength,
        branchColor: state.branchColor,
        leafColor: state.leafColor,
        selectedLeaf: state.colorTabIndex === 1 ? state.selectedLeaf : null
    }
};

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