import { connect } from 'react-redux';
import {branchColor, branchThickness, generateTreeElements, leafColor, leafSize} from "../logic/tree_utils";
import {TreeNode} from "../logic/TreeNodes";
import PropTypes from "prop-types";
import React from "react";
import {resetDisplayDepth, setDisplayDepth, setHoverState, unsetHoverState} from "../actions";

class Tree extends React.Component {
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

        const {branches, leafs, bunches} = generateTreeElements(
            this.displayNode,
            this.props.displayDepth,
            this.props.width,
            this.props.height,
            this.props.trunkLength,
            0);

        const svgStyle = {
            width: this.props.width + "px",
            height: this.props.height + "px",
        };

        const renderedBranches = branches.map((branch, i) => {
            const lineStyle = {
                strokeWidth: branchThickness(branch, "SAMPLES", this.displayNode.samples),
                stroke: branchColor(this.props.branchColor, branch),
            };
            return (<line key={i}
                          x1={branch.x}
                          y1={branch.y}
                          x2={branch.x2}
                          y2={branch.y2}
                          style={lineStyle}
                          onClick={() => this.renderSubtree(branch)}
                          onMouseEnter={() => this.props.hoverBranch(branch)}
                          onMouseLeave={this.props.unhover} />)
        });

        const renderedLeafs = leafs.map((leaf, i) => {
            const circleStyle = {
                fill: leafColor(this.props.leafColor, leaf),
            };
            return (<circle key={i}
                            cx={leaf.x}
                            cy={leaf.y}
                            r={leafSize(leaf, "SAMPLES", this.displayNode.samples)}
                            style={circleStyle}
                            onMouseEnter={() => this.props.hoverLeaf(leaf)}
                            onMouseLeave={this.props.unhover} />)
        });

        /*
        console.log(bunches);
        const renderedBunches = bunches.map((bunch, i) => {
            return <Pie key={i}
                        bunch={bunch}
                        radius={this.leafSize(bunch, "SAMPLES", this.props.totalSamples)} />
        }); */

        return (
            <div>
                <svg className="Tree" style={svgStyle}>
                    {renderedBranches}
                    {renderedLeafs}
                </svg>

                <span className="ResetZoomButton button is-small">
                    <span className="icon">
                        <i className="fas fa-undo" />
                    </span>
                    <span onClick={this.renderBaseTree}>Reset Zoom</span>
                </span>
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
)(Tree)