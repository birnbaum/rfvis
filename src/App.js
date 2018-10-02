import React from 'react';
import './App.scss';
import Menu from "./components/Menu";
import Sidebar from "./components/Sidebar";
import TreeView from "./components/TreeView";

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <Menu />
                <Sidebar />

                <div id="content">
                    <TreeView />
                </div>
            </div>
        );
    }
}

export default App;
