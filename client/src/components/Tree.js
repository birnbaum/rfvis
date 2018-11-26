import {branchColor, branchThickness, generateTreeElements, leafColor, leafSize} from "../logic/tree_utils";
import PropTypes from "prop-types";
import React from "react";
import PieChart from "./pie/PieChart";


export default class Tree extends React.Component {
    static propTypes = {
        displayNode: PropTypes.any.isRequired,
        displayDepth: PropTypes.number.isRequired,
        trunkLength: PropTypes.number.isRequired,
        branchColor: PropTypes.string.isRequired,
        leafColor: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,

        returnValidSVG: PropTypes.bool,

        renderSubtree: PropTypes.func,
        hoverBranch: PropTypes.func,
        hoverLeaf: PropTypes.func,
        hoverBunch: PropTypes.func,
        unhover: PropTypes.func,
    };

    static defaultProps = {
        returnValidSVG: false,
    };

    render() {
        const {branches, leafs, bunches} = generateTreeElements(
            this.props.displayNode,
            this.props.displayDepth,
            this.props.width,
            this.props.height,
            this.props.trunkLength,
            0);

        const renderedBranches = branches.map((branch, i) =>
            <line key={i}
                  x1={branch.x}
                  y1={branch.y}
                  x2={branch.x2}
                  y2={branch.y2}
                  style={{
                      strokeWidth: branchThickness(branch, this.props.displayNode.samples),
                      stroke: branchColor(this.props.branchColor, branch),
                  }}
                  onClick={() => this.props.renderSubtree(branch)}
                  onMouseEnter={() => this.props.hoverBranch(branch)}
                  onMouseLeave={this.props.unhover} />
        );

        const renderedLeafs = leafs.map((leaf, i) =>
            <circle key={i}
                    cx={leaf.x}
                    cy={leaf.y}
                    r={leafSize(leaf, this.props.displayNode.samples)}
                    style={{
                        fill: leafColor(this.props.leafColor, leaf),
                    }}
                    onMouseEnter={() => this.props.hoverLeaf(leaf)}
                    onMouseLeave={this.props.unhover} />
        );

        const renderedBunches = bunches.map((bunch, i) =>
            <PieChart key={i}
                      bunch={bunch}
                      radius={leafSize(bunch, this.props.displayNode.samples)}
                      leafColorType={this.props.leafColor} />
        );

        if (this.props.returnValidSVG) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     version="1.1"
                     width={this.props.width}
                     height={this.props.height}>
                    {renderedBranches}
                    {renderedLeafs}
                    {renderedBunches}
                </svg>
            );
        } else {
            return (
                <svg className="Tree"
                     style={{
                         width: this.props.width + "px",
                         height: this.props.height + "px",
                     }}>
                    {renderedBranches}
                    {renderedLeafs}
                    {renderedBunches}
                </svg>
            );
        }
    }
}