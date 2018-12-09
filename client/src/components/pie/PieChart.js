/**
 * Original source: https://github.com/toomuchdesign/react-minimal-pie-chart
 */

import React from 'react';
import PropTypes from 'prop-types';
import Path from './PieChartPath';
import {getLeafNodes, leafColor} from "../../logic/tree_utils";
import {LEAF_COLORS} from "../../constants";

const sumValues = data =>
    data.reduce((acc, dataEntry) => acc + dataEntry.value, 0);

const evaluateDegreesFromValues = (data, totalValue) => {
    const total = totalValue || sumValues(data);
    // Append "degrees" into each data entry
    return data.map(dataEntry =>
        Object.assign(
            { degrees: (dataEntry.value / total) * 360 },
            dataEntry
        )
    );
};

const makeSegments = (data, props) => {
    // Keep track of how many degrees have already been taken
    let lastSegmentAngle = -90;  // Start at the top
    let style = props.segmentsStyle;

    return data.map((dataEntry, index) => {
        const startAngle = lastSegmentAngle;
        lastSegmentAngle += dataEntry.degrees;

        return (
            <Path
                key={dataEntry.key || index}
                cx={props.bunch.x}
                cy={props.bunch.y}
                startAngle={startAngle}
                lengthAngle={dataEntry.degrees}
                radius={props.radius}
                style={style}
                stroke={dataEntry.color}
                fill="none"
                onMouseOver={
                    props.onMouseOver && (e => props.onMouseOver(e, props.data, index))
                }
                onMouseOut={
                    props.onMouseOut && (e => props.onMouseOut(e, props.data, index))
                }
                onClick={props.onClick && (e => props.onClick(e, props.data, index))} />
        );
    });
};



/**
 * Computes a histogram over the samples contained the leaf nodes of a sub branch
 * @param node {TreeNode} - Base node of the sub branch
 * @param type {string} - Type of property over which the histogram shall be computed.
 *      Can be either IMPURITY or BEST_CLASS.
 * @param weighted {boolean} - If false al leafs have the same cardinality. If true the leafs are weighted by the number
 *      of contained samples.
 * @returns {{value: number, color: string, value: (number|string)}[]} - See drawPie() for more information
 */
const getHistogram = (node, type, weighted = true) => {
    const histObj = {};
    if (type === LEAF_COLORS.IMPURITY) {
        const leafNodes = getLeafNodes(node);
        for (const leafNode of leafNodes) {
            const impurity = leafNode.impurity.toFixed(1); // Converting all impurities to strings with two decimal places
            const n = weighted ? leafNode.n_node_samples : 1;
            if (impurity in histObj) {
                histObj[impurity] += n;
            } else {
                histObj[impurity] = n;
            }
        }
        const ordered = [];
        Object.keys(histObj).sort().forEach(key => {
            const color = leafColor(type, {impurity: Number.parseFloat(key)});
            ordered.push({title: String(histObj[key]), color: color, value: histObj[key]});
        });
        return ordered;
    } else if (type === LEAF_COLORS.BEST_CLASS) {
        return node.classDistribution;
    } else if (type === LEAF_COLORS.BLACK) {
        return [{title: "1", color: "rgb(0, 0, 0)", value: 1}]
    } else if (type === "PATH") {
        if (node.selectedPathElement) {
            return [{title: "1", color: "rgb(255, 0, 0)", value: 1}]
        } else {
            return [{title: "1", color: "rgba(0, 0, 0, 0.5)", value: 1}];
        }
    } else {
        throw Error(`Unknown leaf color type "${type}" for bunch`);
    }
};

export default class PieChart extends React.PureComponent {
    static propTypes = {
        bunch: PropTypes.any.isRequired,
        radius: PropTypes.number.isRequired,
        leafColorType: PropTypes.string.isRequired,
        totalValue: PropTypes.number,
        segmentsStyle: PropTypes.objectOf(
            PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        ),
        onClick: PropTypes.func,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
    };

    render() {
        const histogram = getHistogram(this.props.bunch.baseNode, this.props.leafColorType);
        const normalizedData = evaluateDegreesFromValues(histogram, this.props.totalValue);
        return (
            <g onMouseEnter={() => this.props.onMouseEnter(this.props.bunch)}
               onMouseLeave={this.props.onMouseLeave}>
                {makeSegments(normalizedData, this.props)}
            </g>
        );
    }
}