import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import DownloadButton from "../components/DownloadButton";

import computeTreePositions from "../logic/compute_coordinates";
import {connect} from "react-redux";
import {setCurrentTreeId, setHoverState, unsetHoverState} from "../actions";

class ForestView extends React.Component {
    static propTypes = {
        forest: PropTypes.any.isRequired,
        currentTreeId: PropTypes.number.isRequired,
        size: PropTypes.number.isRequired,
        selectTree: PropTypes.func.isRequired,
        hoverTree: PropTypes.func.isRequired,
        unhover: PropTypes.func.isRequired,
    };

    render() {
        if (!this.props.forest) {
            return <span>Loading...</span>;
        }

        const svgStyle = {
            width: this.props.size + "px",
            height: this.props.size + "px",
        };

        // Only compute on first render() (performance improvement, may be removed once switching forests is supported)
        if (!this.treePositions) {
            this.treePositions = computeTreePositions(this.props.forest);
        }

        const activeTree = this.treePositions[this.props.currentTreeId];
        const renderedActiveTree = (
            <circle cx={activeTree.x / 100 * this.props.size}
                    cy={activeTree.y / 100 * this.props.size}
                    r={treeSize(activeTree, this.props.size / 25 + this.props.size / 100)}
                    style={{
                        fill: "white",
                        stroke: treeColor(activeTree),
                        strokeWidth: this.props.size / 300,
                    }} />
        );

        const renderedTrees = this.treePositions.map((treePosition, i) =>
            <circle key={i}
                    cx={treePosition.x / 100 * this.props.size}
                    cy={treePosition.y / 100 * this.props.size}
                    r={treeSize(treePosition, this.props.size / 25)}
                    style={{fill: treeColor(treePosition)}}
                    onClick={() => this.props.selectTree(i)}
                    onMouseEnter={() => this.props.hoverTree(this.props.forest.trees[this.props.currentTreeId])}
                    onMouseLeave={this.props.unhover} />
        );

        return (
            <div className="ForestView">
                <svg id="forest" className="Forest" style={svgStyle}>
                    {renderedActiveTree}
                    {renderedTrees}
                </svg>
                <DownloadButton filename={`forest.svg`}
                                svgId={"forest"} />
            </div>
        );
    }
}

function treeColor(tree) {  // TODO move to utils
    const scale = d3.scaleLinear()
        .domain([1, 0.5, 0.05, 0])
        .range(["red", "red", "green", "green"]);
    return scale(tree.error);
}

function treeSize(tree, maxRadius) {  // TODO move to utils
    const radius = area => Math.sqrt(area / Math.PI);
    const scale =  d3.scaleLinear()
        .domain([0, radius(0.6), radius(1)])
        .range([maxRadius / 2, maxRadius / 2, maxRadius]);
    return scale(radius(1 - tree.error));
}

const mapStateToProps = (state, ownProps) => ({
    forest: state.forest,
    currentTreeId: state.currentTreeId,
    size: 300,  // TODO make dynamic
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    selectTree: id => dispatch(setCurrentTreeId(id)),
    hoverTree: tree => dispatch(setHoverState("TREE", tree)),
    unhover: () => dispatch(unsetHoverState()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ForestView)
