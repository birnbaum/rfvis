import "./Sidebar.css";

import React from "react";
import ForestView from "./ForestView";
import PropTypes from 'prop-types';

export default class Sidebar extends React.Component {

    render() {
        // TODO size
        return (
            <div className="Sidebar">
                <ForestView forest={this.props.forest}
                            size={300}
                            updateTreeVisualization={this.props.updateTreeVisualization} />

                <div className="buttons has-addons">
                    <span className="Sidebar-treeSwitchButton button is-small"
                          onClick={this.previousTree}>
                        <span className="icon">
                            <i className="fas fa-arrow-alt-circle-left" />
                        </span>
                        <span>Previous</span>
                    </span>
                    <span className="Sidebar-treeSwitchButton button is-small"
                          onClick={this.nextTree}>
                        <span>Next</span>
                        <span className="icon">
                            <i className="fas fa-arrow-alt-circle-right" />
                        </span>
                    </span>
                </div>

                <div className="space" />

                <div id="info">
                    <div id="hover-info" />
                </div>

                <div className="space" />

                <ResetZoomButton onClick={this.props.resetTree} />

                <div className="space" />

            </div>
        );
    }

    nextTree = () => {
        let id;
        if (this.props.currentTreeId === this.props.forest.trees.length - 1) {
            id = 0;
        } else {
            id = this.props.currentTreeId + 1;
        }
        this.props.updateTreeVisualization(id);
    };

    previousTree = () => {
        let id;
        if (this.props.currentTreeId === 0) {
            id = this.props.forest.trees.length - 1;
        } else {
            id = this.props.currentTreeId - 1;
        }
        this.props.updateTreeVisualization(id);
    };
}

Sidebar.propTypes = {
    forest: PropTypes.any.isRequired,
    currentTreeId: PropTypes.number.isRequired,
    updateTreeVisualization: PropTypes.func.isRequired,
    resetTree: PropTypes.func.isRequired,
};


const ResetZoomButton = (props) => (
    <span className="ResetZoomButton button is-small">
        <span className="icon">
            <i className="fas fa-undo" />
        </span>
        <span onClick={props.onClick}>Reset Zoom</span>
    </span>
);

ResetZoomButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};