import React from 'react';
import Menu from "../components/Menu";
import Sidebar from "../components/Sidebar";
import TreeView from "./TreeView";
import PropTypes from "prop-types";

import {setCurrentTreeId, setForest, setTitle} from "../actions";
import {connect} from "react-redux";

import createForest from "../logic/parser"

class App extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
        setForest: PropTypes.func.isRequired,
        setTitle: PropTypes.func.isRequired,
    };

    async componentDidMount() {
        const rawData = await (await fetch(window.location.origin + "/data")).json();  // TODO Error handling
        const forest = createForest(rawData);
        this.props.setForest(forest);
        fetch(window.location.origin + "/info")
            .then(res => res.json())
            .then(json => this.props.setTitle(json.name));
    }

    render() {
        if (this.props.loading) {
            return (
                <div className="spinner">
                    <div className="double-bounce1" />
                    <div className="double-bounce2" />
                    <span className="spinner-text">Loading data ...</span>
                </div>
            );
        } else {
            return (
                <div className="App">
                    <Menu title={this.props.title} />
                    <Sidebar />
                    <TreeView />
                </div>
            );
        }
    }
}

const mapStateToProps = (state, ownProps) => ({
    title: state.title ? state.title : "...",
    loading: state.forest === null,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setForest: forest => {
        dispatch(setForest(forest));
        dispatch(setCurrentTreeId(0));
    },
    setTitle: title => dispatch(setTitle(title))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);