/**
 * Original source: https://github.com/toomuchdesign/react-minimal-pie-chart
 */

import React, { PureComponent } from 'react';
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
 * @returns {{value: number, color: string, sortKey: (number|string)}[]} - See drawPie() for more information
 */
const getHistogram = (node, type, weighted = true) => {
    const leafNodes = getLeafNodes(node);
    const histObj = {};
    if (type === LEAF_COLORS.IMPURITY) {
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
        for (const leafNode of leafNodes) {
            const n = weighted ? leafNode.bestClass.count : 1;
            if (leafNode.bestClass.name in histObj) {
                histObj[leafNode.bestClass.name][0] += n
            } else {
                histObj[leafNode.bestClass.name] = [n];
            }
            histObj[leafNode.bestClass.name][1] = leafNode.bestClass.color;
        }
        const ordered = [];
        Object.keys(histObj).sort().forEach(key => {
            const color = leafColor(type, {bestClass: {color: histObj[key][1]}});
            ordered.push({title: String(histObj[key][0]), color: color, value: histObj[key][0]});
        });
        return ordered;
    } else {
        throw Error(`Unknown leaf color type "${type}" for bunch`);
    }

    /*
    // TODO
    if (type === "PATH") {
        return [
            {value: 1,
                color: "rgba(0, 0, 0, 0.5)",
                sortKey: "0"}
                ]
    ]
    } */
};

export default class PieChart extends PureComponent {
    static propTypes = {
        bunch: PropTypes.any.isRequired,
        radius: PropTypes.number.isRequired,
        leafColorType: PropTypes.string.isRequired,
        totalValue: PropTypes.number,
        segmentsStyle: PropTypes.objectOf(
            PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        ),
        onMouseOver: PropTypes.func,
        onMouseOut: PropTypes.func,
        onClick: PropTypes.func,
    };

    render() {
        const data = getHistogram(this.props.bunch.baseNode, this.props.leafColorType);
        const normalizedData = evaluateDegreesFromValues(data, this.props.totalValue);
        return makeSegments(normalizedData, this.props);
    }
}