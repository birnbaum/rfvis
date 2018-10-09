import React from 'react';
import './App.css';
import Menu from "./components/Menu";
import Sidebar from "./components/Sidebar";
import TreeView from "./components/TreeView";

import createForest from "./logic/parser"

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            forest: null,
            leftColumnWidth: 1, // ???
            currentTreeId: 0,
            trunkLength: 100,
            branchColor: "IMPURITY",
            leafColor: "IMPURITY",
        };
    }

    async componentDidMount() {
        const rawData = await (await fetch(window.location.origin + "/data")).json();
        this.setState({forest: createForest(rawData)});

        fetch(window.location.origin + "/info")
            .then(res => res.json())
            .then(json => this.setState({title: json.name}));
    }

    render() {
        let tree;
        let totalSamples;
        if (this.state.forest) {
            tree = this.state.forest.trees[this.state.currentTreeId];
            totalSamples = this.state.forest.totalSamples;
        } else {
            tree = null;
            totalSamples = 0;
        }
        return (
            <div className="App">
                <Menu title={this.state.title} />
                <Sidebar />

                <div id="content">
                    <TreeView tree={tree}
                              totalSamples={totalSamples}
                              maxDepth={30}
                              width={800}
                              height={800}
                              trunkLength={this.state.trunkLength}
                              branchColor={this.state.branchColor}
                              leafColor={this.state.leafColor}/>
                </div>
            </div>
        );
    }
}

export default App;
