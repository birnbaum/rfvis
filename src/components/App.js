import React from 'react';
import Menu from "./Menu";
import Sidebar from "./Sidebar";
import TreeView from "./TreeView";

import createForest from "../logic/parser"

export default class App extends React.Component {
    state = {
        title: "",
        forest: null,
        currentTreeId: 0,
        displayDepth: 0,
        maxDepth: 0,
        trunkLength: 100,
        branchColor: "IMPURITY",  // TODO remove
        leafColor: "IMPURITY",  // TODO remove
    };

    async componentDidMount() {
        const rawData = await (await fetch(window.location.origin + "/data")).json();
        const forest = createForest(rawData);
        this.setState({forest: forest});

        this.updateTreeVisualization(this.state.currentTreeId);

        fetch(window.location.origin + "/info")
            .then(res => res.json())
            .then(json => this.setState({title: json.name}));
    }

    render() {
        if (!this.state.forest) {
            return (
                <div className="spinner">
                    <div className="double-bounce1" />
                    <div className="double-bounce2" />
                    <span className="spinner-text">Loading data ...</span>
                </div>
            );
        }

        return (
            <div className="App">
                <Menu title={this.state.title} />

                <Sidebar forest={this.state.forest}
                         currentTreeId={this.state.currentTreeId}
                         updateTreeVisualization={this.updateTreeVisualization}
                         resetTree={this.resetTree}/>

                <div id="content">
                    <TreeView tree={this.state.forest.trees[this.state.currentTreeId]}
                              totalSamples={this.state.forest.totalSamples}
                              displayDepth={this.state.displayDepth}
                              trunkLength={this.state.trunkLength}
                              branchColor={this.state.branchColor}
                              leafColor={this.state.leafColor}
                              width={800}
                              height={800}
                              resetTree={this.resetTree} />
                </div>
            </div>
        );
    }

    /**
     * Sets the maxDepth variable and updates the corresponding input element
     * @param {Tree} tree
     */
    updateTreeVisualization = (id) => {
        const tree = this.state.forest.trees[id];
        const newMaxDepth = getMaxDepth(tree);

        // If the old setting is equal to the old max, we assume the user did
        // not touch the input and set both values to the new max depth.
        // Otherwise (e.g. if the user manually set the max depth to 5) we assume
        // this same setting should be applied even after the tree view updates
        // and we do not update the value of the input.
        let newDisplayDepth = this.state.displayDepth;
        if (newDisplayDepth === this.state.maxDepth) {
            newDisplayDepth = newMaxDepth;
        }

        this.setState({
            currentTreeId: id,
            displayDepth: newDisplayDepth,
            maxDepth: newMaxDepth,
        });
    }
}


/**
 * Finds the maximal depth of a tree
 * @param {Tree} tree
 * @returns {number}
 */
function getMaxDepth(tree) {  // TODO location
    let maxDepth = 0;
    function findMaxDepth(node) {
        if (node.children) {
            findMaxDepth(node.children[0]);
            findMaxDepth(node.children[1]);
        } else if (node.depth > maxDepth) {
            maxDepth = node.depth;
        }
    }
    findMaxDepth(tree.baseNode);
    return maxDepth + 1;
}