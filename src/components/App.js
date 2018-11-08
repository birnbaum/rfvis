import React from 'react';
import './App.css';
import Menu from "./Menu";
import Sidebar from "./Sidebar";
import TreeView from "./TreeView";

import createForest from "../logic/parser"

export default class App extends React.Component {
    state = {
        title: "",
        forest: null,
        leftColumnWidth: 1, // ???
        currentTreeId: 0,
        depth: 0,
        maxDepth: 0,
        trunkLength: 100,
        branchColor: "IMPURITY",
        leafColor: "IMPURITY",
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
                <Menu title={this.state.title}
                      depth={this.state.depth}
                      maxDepth={this.state.maxDepth}
                      changeDepth={this.changeDepth}
                      trunkLength={this.state.trunkLength}
                      changeTrunkLength={this.changeTrunkLength}
                      branchColor={this.state.branchColor}
                      changeBranchColor={this.changeBranchColor}
                      leafColor={this.state.leafColor}
                      changeLeafColor={this.changeLeafColor} />

                <Sidebar forest={this.state.forest}
                         currentTreeId={this.state.currentTreeId}
                         updateTreeVisualization={this.updateTreeVisualization}
                         resetTree={this.resetTree}/>

                <div id="content">
                    <TreeView tree={this.state.forest.trees[this.state.currentTreeId]}
                              totalSamples={this.state.forest.totalSamples}
                              depth={this.state.depth}
                              maxDepth={this.state.maxDepth}
                              width={800}
                              height={800}
                              trunkLength={this.state.trunkLength}
                              branchColor={this.state.branchColor}
                              leafColor={this.state.leafColor}
                              resetTree={this.resetTree} />
                </div>
            </div>
        );
    }

    changeDepth = (e) => {
        this.setState({maxDepth: Number.parseInt(e.target.value)});
    };

    changeTrunkLength = (e) => {
        this.setState({trunkLength: Number.parseInt(e.target.value)});
    };

    changeBranchColor = (e) => {
        this.setState({branchColor: e.target.value});
    };

    changeLeafColor = (e) => {
        this.setState({leafColor: e.target.value});
    };

    resetTree = (e) => {
        // TODO
    };

    /**
     * Sets the maxDepth variable and updates the corresponding input element
     * @param {Tree} tree
     */
    updateTreeVisualization(id) {
        const tree = this.state.forest.trees[id];
        const newMaxDepth = getMaxDepth(tree);

        // If the old setting is equal to the old max, we assume the user did
        // not touch the input and set both values to the new max depth.
        // Otherwise (e.g. if the user manually set the max depth to 5) we assume
        // this same setting should be applied even after the tree view updates
        // and we do not update the value of the input.
        let depth = this.state.depth;
        if (this.state.depth === this.state.maxDepths) {
            depth = newMaxDepth;
        }

        this.setState({
            currentTreeId: id,
            depth: depth,
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