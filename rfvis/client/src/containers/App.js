import React from 'react';
import Menu from "../components/Menu";
import Sidebar from "../components/Sidebar";
import TreeView from "./TreeView";
import PropTypes from "prop-types";

import {setCurrentTreeId, setForest} from "../actions";
import {connect} from "react-redux";

import createForest from "../utils/parser"

class App extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
        setForest: PropTypes.func.isRequired,
    };

    state = {
        loadError: null,
    };

    async componentDidMount() {
        // TODO Improve error messages
        try {
            const response = await fetch(window.location.origin + "/data");
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const rawData = await response.json();
            const forest = createForest(rawData);
            this.props.setForest(forest);
        } catch (e) {
            console.error(e);
            return this.setState({loadError: e});
        }
    }

    render() {
        if (this.state.loadError) {
            return (
                <div className="spinner">
                    <span className="spinner-text">
                        An error occurred:
                        <br />
                        "{this.state.loadError.message}"
                        <br />
                        <br />
                        Please check the logs for details.
                    </span>
                </div>
            );
        } else if (this.props.loading) {
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
    title: state.forest ? state.forest.name : "...",
    loading: state.forest === null,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setForest: forest => {
        dispatch(setForest(forest));
        dispatch(setCurrentTreeId(0));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);