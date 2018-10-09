import "./DownloadButton.css"

import React from "react";
import PieChart from "react-minimal-pie-chart";
import {LeafNode} from "../logic/TreeNodes";


export default class Pie extends React.Component {
    render() {
        const data = this.getHistogram(this.props.bunch.baseNode, "IMPURITY", true);

        return <PieChart
            data={[
                { title: 'One', value: 10, color: '#E38627' },
                { title: 'Two', value: 15, color: '#C13C37' },
                { title: 'Three', value: 20, color: '#6A2135' },
            ]}
        />;

        return (
            <PieChart data={data}
                      cx={this.props.bunch.x}
                      cy={this.props.bunch.y}
                      radius={this.props.radius} /> // TODO Mouseover
        )
    }

    /**
     * Computes a histogram over the samples contained the leaf nodes of a sub branch
     * @param node {InternalNode} - Base node of the sub branch
     * @param type {string} - Type of property over which the histogram shall be computed.
     *      Can be either IMPURITY or BEST_CLASS.
     * @param weighted {boolean} - If false al leafs have the same cardinality. If true the leafs are weighted by the number
     *      of contained samples.
     * @returns {{value: number, color: string, sortKey: (number|string)}[]} - See drawPie() for more information
     */
    getHistogram(node, type, weighted) {
        const leafNodes = this.getLeafNodes(node);
        const histObj = {};
        if (type === "IMPURITY") {
            for (const leafNode of leafNodes) {
                const impurity = leafNode.impurity.toFixed(1); // Converting all impurities to strings with two decimal places
                const n = weighted ? leafNode.samples : 1;
                if (impurity in histObj) {
                    histObj[impurity] += n;
                } else {
                    histObj[impurity] = n;
                }
            }
            const ordered = [];
            Object.keys(histObj).sort().forEach(key => {
                // const color = this.leafColor(type, {impurity: Number.parseFloat(key)});
                ordered.push({title: String(histObj[key]), color: "#888", value: histObj[key]});
            });
            return ordered;
        } else if (type === "BEST_CLASS") {
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
                const color = this.leafColor(type, {bestClass: {color: histObj[key][1]}});
                ordered.push({title: String(histObj[key][0]), color: color, value: histObj[key][0]});
            });
            return ordered;
        } else {
            throw "ei ei ei";
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
    }

    /**
     * Walks the entire tree and returns all leaf nodes
     * @param node {InternalNode} - Base node of the tree
     * @returns {LeafNode[]} - List of all lead nodes of the tree
     */
    getLeafNodes(node) {
        const leafNodes = [];
        function searchLeafs(node) {
            if (node instanceof LeafNode) {
                leafNodes.push(node);
            } else {
                searchLeafs(node.children[0]);
                searchLeafs(node.children[1]);
            }
        }
        searchLeafs(node);
        return leafNodes;
    }
}