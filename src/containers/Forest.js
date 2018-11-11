import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

import computeTreePositions from "../logic/compute_coordinates";
import {connect} from "react-redux";

class Forest extends React.Component {
    static propTypes = {
        forest: PropTypes.any.isRequired,
        currentTreeId: PropTypes.number.isRequired,
        size: PropTypes.number.isRequired,
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
        // TODO Draw active tree circles

        const renderedTrees = this.treePositions.map((treePosition, i) => {
            const treeStyle = {
                fill: treeColor(treePosition),
            };
            return (<circle key={i}
                            cx={treePosition.x / 100 * this.props.size}
                            cy={treePosition.y / 100 * this.props.size}
                            r={treeSize(treePosition, this.props.size / 25)}
                            style={treeStyle} />)
            // TODO Click
            // TODO Mouseover
        });

        return (
            <svg className="Forest" style={svgStyle}>
                {renderedTrees}
            </svg>
        );
    }
}

function treeColor(tree) {  // TODO move to utils
    const scale = d3.scaleLinear()
        .domain([1, 0.5, 0.05, 0])
        .range(["red", "red", "green", "green"]);
    return scale(tree.oobError);
}

function treeSize(tree, maxRadius) {  // TODO move to utils
    const radius = area => Math.sqrt(area / Math.PI);
    const scale =  d3.scaleLinear()
        .domain([0, radius(0.6), radius(1)])
        .range([maxRadius / 2, maxRadius / 2, maxRadius]);
    return scale(radius(1 - tree.oobError));
}

const mapStateToProps = (state, ownProps) => ({
    forest: state.forest,
    currentTreeId: state.currentTreeId,
    size: 300,  // TODO make dynamic
});

export default connect(
    mapStateToProps
)(Forest)
