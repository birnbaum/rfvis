import React from "react";
import PropTypes from 'prop-types';
import DownloadButton from "./DownloadButton";

import {
    generateTreeElements,
    branchThickness,
    branchColor,
    leafSize,
    leafColor,
} from "../logic/tree_utils";
import {TreeNode} from "../logic/TreeNodes";


export default class TreeView extends React.Component {
    state = {
        displayTree: null,
    };

    render() {
        if (!this.props.tree) {
            return <span>Fetching data...</span>
        }

        const tree = (this.displayTree != null) ? this.displayTree : this.props.tree;

        const {
            branches,
            leafs,
            bunches,
        } = generateTreeElements(tree,
                                 this.props.totalSamples,
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
                strokeWidth: branchThickness(branch, "SAMPLES", this.props.totalSamples),
                stroke: branchColor(this.props.branchColor, branch),
            };
            return (<line key={i}
                          x1={branch.x}
                          y1={branch.y}
                          x2={branch.x2}
                          y2={branch.y2}
                          style={lineStyle} />)
            // TODO Mouseover
            // TODO Click
        });

        const renderedLeafs = leafs.map((leaf, i) => {
            const circleStyle = {
                fill: leafColor(this.props.leafColor, leaf),
            };
            return (<circle key={i}
                            cx={leaf.x}
                            cy={leaf.y}
                            r={leafSize(leaf, "SAMPLES", this.props.totalSamples)}
                            style={circleStyle} />)
            // TODO Mouseover
        });

        /*
        console.log(bunches);
        const renderedBunches = bunches.map((bunch, i) => {
            return <Pie key={i}
                        bunch={bunch}
                        radius={this.leafSize(bunch, "SAMPLES", this.props.totalSamples)} />
        }); */

        return (
            <div className="TreeView">
                <svg className="Tree" style={svgStyle}>
                    {renderedBranches}
                    {renderedLeafs}
                </svg>
                <DownloadButton />
            </div>
        );
    }
}

TreeView.propTypes = {
    tree: PropTypes.shape({
        oobError: PropTypes.number.isRequired,
        baseNode: function(props, propName, componentName) {
            if (!(props[propName] instanceof TreeNode)) {
                return new Error(`Validation failed: ${componentName}.${propName} not of type TreeNode`);
            }
        },
    }).isRequired,
    totalSamples: PropTypes.number.isRequired,  // for calculating the correct leaf/branch sizes
    displayDepth: PropTypes.number.isRequired,

    trunkLength: PropTypes.number.isRequired,
    branchColor: PropTypes.string.isRequired,
    leafColor: PropTypes.string.isRequired,

    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,

    resetTree: PropTypes.func.isRequired,
};

