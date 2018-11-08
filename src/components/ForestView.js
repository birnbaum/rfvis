import "./ForestView.css"

import React from "react";
import DownloadButton from "./DownloadButton";
import PropTypes from "prop-types";
import * as d3 from "d3";

import computeTreePositions from "../logic/compute_coordinates";

export default class ForestView extends React.Component {
    render() {
        const svgStyle = {
            width: this.props.size + "px",
            height: this.props.size + "px",
        };

        const treePositions = computeTreePositions(this.props.forest);
        // TODO active tree circles

        const renderedTrees = treePositions.map((treePosition, i) => {
            const treeStyle = {
                fill: treeColor(treePosition),
            };
            return (<circle key={i}
                            onClick={this.props.updateTreeVisualization}
                            cx={treePosition.x / 100 * this.props.size}
                            cy={treePosition.y / 100 * this.props.size}
                            r={treeSize(treePosition, this.props.size / 25)}
                            style={treeStyle} />)  // TODO Mouseover
        });

        return (
            <div className="ForestView" style={svgStyle}>
                <svg className="Forest">
                    {renderedTrees}
                </svg>
                <DownloadButton onClick={this.downloadSVG} />
            </div>
        );
    }

    downloadSVG = () => {  // TODO make utility class
        // TODO implement
    }
}

ForestView.propTypes = {
    forest: PropTypes.any.isRequired,
    size: PropTypes.number.isRequired,
    updateTreeVisualization: PropTypes.func.isRequired,
};

function treeColor(tree) {
    return d3.scaleLinear()
        .domain([1, 0.5, 0.05, 0])
        .range(["red", "red", "green", "green"])
        (tree.oobError);
}

function treeSize(tree, maxRadius) {
    const radius = area => Math.sqrt(area / Math.PI);
    return d3.scaleLinear()
        .domain([0, radius(0.6), radius(1)])
        .range([maxRadius / 2, maxRadius / 2, maxRadius])
        (radius(1 - tree.oobError))
}